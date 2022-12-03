export const GreekWordStudy = (word: string) => {
    return `https://www.perseus.tufts.edu/hopper/morph?l=${encodeURIComponent(word)}&la=greek`;
};

export const EnglishWordSearch = (word: string) => {
    return `https://www.perseus.tufts.edu/hopper/searchresults?target=en&collections=Perseus%3Acollection%3AGreco-Roman&collections=Perseus%3Acollection%3AArabic&collections=Perseus%3Acollection%3AGermanic&collections=Perseus%3Acollection%3Acwar&collections=Perseus%3Acollection%3ARenaissance&collections=Perseus%3Acollection%3ARichTimes&collections=Perseus%3Acollection%3APDILL&all_words=${encodeURIComponent(
        word
    )}&phrase=&any_words=&exclude_words=&search=Search`;
};
