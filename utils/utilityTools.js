function formatingString(string){
    // Replace whitespaces with "-"
    const stringWithoutSpaces = string.replace(/\s+/g, '-');

    const stringWithoutSpacesAndTilde = stringWithoutSpaces.replace(/~/g, '-');

    // Remove special characters like "#"
    const stringWithoutSpecialChars = stringWithoutSpacesAndTilde.replace(/[^\w\s-àèìòùáéíóúýâêîôûãñõäëïöüÿåæœçðÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÅÆŒÇ]/g, '');

    // Replace consecutive "-" with a single "-"
    return stringWithoutSpecialChars.replace(/-+/g, '-');
}

module.exports = {
    formatingString,
}
