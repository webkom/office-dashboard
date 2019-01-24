const getPlural = (word, suffix, value) => {
    const plural = word + suffix;
    if (value === '?' || value === 0) {
        return plural;
    }
    return value === 1 ? word : plural;
}

export default getPlural;
