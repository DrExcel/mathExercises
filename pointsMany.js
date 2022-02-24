	// Moodle
	var moodle;
	const moodleStg = 'elearning.dhbw-stuttgart.de';
	if (location.host == moodleStg) moodle = true; else moodle = false;
	const moodleId = '227326'; // ID der Moodle-redirect-Seite