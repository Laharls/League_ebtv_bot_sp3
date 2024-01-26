function formatingString(string){
    // Replace whitespaces with "-"
    const stringWithoutSpaces = string.replace(/\s+/g, '-');

    // Remove special characters like "#"
    const stringWithoutSpecialChars = stringWithoutSpaces.replace(/[^\w\s-àèìòùáéíóúýâêîôûãñõäëïöüÿåæœçðÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÅÆŒÇ]/g, '');

    // Replace consecutive "-" with a single "-"
    return stringWithoutSpecialChars.replace(/-+/g, '-');
}

module.exports = {
    formatingString,
}
