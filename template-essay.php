<?php
/**
 * Template Name: Essay Template
 * Template Post Type: page
 */

if(!defined("IN_ONEPAGER")) 
    get_header();

?>

<div id="the-essay" class="slide">
    <?php
    $headline_parts = afct_split_headline(get_the_title());
    ?>
    <div class="text-upper-left">
        <h1><?php echo esc_html($headline_parts['upper']); ?></h1>
    </div>
    <div class="text-lower-right">
        <h1><?php echo esc_html($headline_parts['lower']); ?></h1>
    </div>
    <div class=" text" data-scroll data-scroll-speed="4">
        <h2 class="">African Face, Colonial Tongue <br>By Serati Maseko</h2>
        <p class="">“What would you do if you had two tongues in your mouth’’ began the poem we were studying in English class that day, “and lost the first one, the mother tongue’’. As the all-girls class that I was part of giggled at the imagery, I recognised myself in this predicament. For I too had two tongues in my mouth, except that unlike the author, Sujatta Bhat, I was not losing my mother tongue per se, it was more that it was not rooted firmly enough within me; and the other tongue, the colonial tongue, was where I felt most at home.<br><br>I have always admired people who are able to house these two language identities so neatly within themselves, to speak, and joke, and dream in their mother tongue, and to also speak, and laugh, and write in the colonial tongue. When the colonial tongue is the lingua franca of everyday urban life the space within which the mother tongue has to be reinforced is limited to the home, and can only become strong if it is insisted upon by the family. My mother tongue was at the height of its use when my grandfather was alive, as he did not speak much English, once he passed, my grandmother, an ardent admirer of the British Royal Family, took pride in her grandchildren’s “Queen’s English’’, and did not insist that we respond to her in the mother tongue. And so with the death of both of my grandparents followed the demise of the necessity to speak my mother tongue.<br><br>While some seem to be able to confidently switch between tongues, eloquently expressing themselves in both, my two tongues don’t even compete for space. My colonial tongue governs my mouth and asserts itself even when I think of an expression in my mother tongue; it struggles to blossom out of my mouth, stifled by a deep-seated feeling of imposter syndrome. A feeling that this language does not sound right coming from me. &nbsp;A language is not just an arbitrary means of communication, language is tied to our sense of self, linking us to others who share the same linguistic and cultural identity. And if language shapes the way we think and express ourselves then I am cut off from the width and breadth of experience that can be defined by my mother tongue; with access to only what my colonial tongue can name.<br><br>In an increasingly globalised world of which I am privileged enough to be part of the more than 370 million people considered native English speakers, what value is there in preserving my mother tongue? In a caramel skin-toned and culturally homogenous future, can my mother tongue be found? A language is not just a collection of sounds, a language is an expression and embodiment of culture connecting you to the entire cosmology of its people. My mother tongue connects me to the lineage of the Bantu people who migrated east and south from central Africa thousands of years ago, leaving along their trail breadcrumbs of dialects that lead back to a single ancestral language. The stories of my ancestors, scribed not on parchment, but instead archived within each intonation of a word. If words contain energy, then perhaps my mother tongue creates a distinct electromagnetic imprint in the field, perhaps this electromagnetic pattern is woven together by all of the speakers of this language past and present, collectively forming the poetry, metaphors and proverbs of my mother tongue; the jewellery that beautify the language. And maybe it is this electromagnetic pattern that invokes the spirits, there is a reason why, no matter how broken one’s mother tongue, one cannot pray to the ancestors in the colonial tongue.<br><br>And so, as an artist, how do I tell African stories in a colonial tongue? When my colonial tongue shapes my thoughts, fortified as it is by a lifetime of education, socialisation, and entertainment, how can I continue the legacy of storytelling of my people? Fela Kuti said ‘’you cannot think European and want to write or create something African. You have to think African in everything’. But my colonial tongue dominates my mouth every time I try to search through the rubble of my mind to unearth my mother tongue. Can I push aside my colonial tongue for long enough to fully open the treasure chest of my mother tongue? And when it is opened and it beams with the light of the jewels that it contains, can I wear them and still feel like myself? Can I put on the jewels of my mother tongue, and truly claim them as my own? Can I, as Fela says, think African in everything?<br><br>The search for my mother tongue continues even as my own mother sometimes speaks to me in it, my colonial tongue conquers my mouth, and my mother tongue does not resist. If only I could take off the cloak of my colonial tongue and allow these two identities to co-exist within me. If only I could think with two minds, and speak with two tongues. For I know that truly, I am not one or the other, both identities live and grow within me and cannot be separated from me, and when I am ready I will embrace all that makes me me, and from my African face, and my African mouth will spring forth my African tongue.</p>
        
    </div>
</div>




<?php
if(!defined("IN_ONEPAGER")) 
    get_footer();
