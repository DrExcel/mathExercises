	// Moodle
	var moodle;
	const moodleStg = 'elearning.dhbw-stuttgart.de';
	if (location.host == moodleStg) moodle = true; else moodle = false;
	const moodleId = '259186'; // ID der Moodle-redirect-Seite
