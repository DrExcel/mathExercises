	// Moodle
	var moodle;
	const moodleStg = 'elearning.dhbw-stuttgart.de';
	if (location.host == moodleStg) moodle = true; else moodle = false;
	const moodleId = '293930'; // ID der Moodle-redirect-Seite
