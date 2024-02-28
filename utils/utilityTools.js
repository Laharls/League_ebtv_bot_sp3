function formatingString(string){
    // Replace whitespaces with "-"
    const stringWithoutSpaces = string.replace(/\s+/g, '-');

    const stringWithoutSpacesAndTilde = stringWithoutSpaces.replace(/~/g, '-');

    // Remove special characters like "#"
    const stringWithoutSpecialChars = stringWithoutSpacesAndTilde.replace(/[^\w\s-àèìòùáéíóúýâêîôûãñõäëïöüÿåæœçðÀÈÌÒÙÁÉÍÓÚÝÂÊÎÔÛÃÑÕÄËÏÖÜŸÅÆŒÇ]/g, '');

    // Replace consecutive "-" with a single "-"
    return stringWithoutSpecialChars.replace(/-+/g, '-');
}

function getDayOfWeekWithDate(dateString) {
    let weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    let months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Create a new Date object with the specified date
    let date = new Date(dateString);

    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    let dayOfWeek = date.getDay();

    // Get the weekday name corresponding to the day of the week
    let weekdayName = weekdays[dayOfWeek];

    // Get the month name
    let monthName = months[date.getMonth()];

    // Get the day of the month
    let dayOfMonth = date.getDate();

    // Construct the string in the format "Weekday Day Month"
    let formattedDate = weekdayName + " " + dayOfMonth  + " " + monthName;

    return formattedDate;
}

module.exports = {
    formatingString,
    getDayOfWeekWithDate,
}
