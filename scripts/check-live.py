#!/usr/bin/env python3
"""Verify a deployed theme without credentials, using only public responses."""
import hashlib
import json
import pathlib
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonicals = []
        self.assets = []
        self.h1_count = 0
        self.noindex = False

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag == 'link' and attributes.get('rel') == 'canonical':
            self.canonicals.append(attributes.get('href'))
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'meta' and attributes.get('name') == 'robots':
            self.noindex |= 'noindex' in attributes.get('content', '')
        asset = attributes.get('src') if tag == 'script' else attributes.get('href') if tag == 'link' else None
        if asset and '/themes/afct/' in asset:
            self.assets.append(asset)


def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'AFCT deployment verification'})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read(), response.geturl()


def verify(url):
    content, final_url = fetch(url)
    html = content.decode('utf-8')
    page = Page()
    page.feed(html)
    if page.canonicals != [final_url] or page.h1_count != 1 or page.noindex:
        raise RuntimeError('Homepage canonical, primary heading, or indexability check failed.')
    if 'Fatal error:' in html or 'Warning:' in html:
        raise RuntimeError('The public page contains PHP errors.')
    checked_assets = 0
    for asset in page.assets:
        relative = urllib.parse.urlsplit(asset).path.split('/themes/afct/', 1)[1]
        packaged = pathlib.Path('build/afct') / relative
        if packaged.is_file():
            remote, _ = fetch(urllib.parse.urljoin(url, asset))
            if hashlib.sha256(remote).digest() != hashlib.sha256(packaged.read_bytes()).digest():
                raise RuntimeError('The public site has not received the tested assets yet.')
            checked_assets += 1
    if checked_assets < 3:
        raise RuntimeError('The expected theme styles and scripts are missing.')
    sitemap, _ = fetch(urllib.parse.urljoin(url, '/wp-sitemap.xml'))
    if b'<sitemapindex' not in sitemap:
        raise RuntimeError('The CMS sitemap index is unavailable.')
    print(f'Deployment verified: canonical, primary heading, indexability, sitemap, and {checked_assets} assets.')


if __name__ == '__main__':
    for attempt in range(6):
        try:
            verify(sys.argv[1])
            break
        except Exception:
            if attempt == 5:
                # Avoid printing URLs or server responses into public CI logs.
                sys.exit('Public deployment verification failed. Check Plesk deployment status and site output.')
            time.sleep(5)
