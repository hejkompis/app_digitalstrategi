<?php

	// http://digiplay.dev/api/20024/144123/anton.sorlin@digitalstrategi.se

	
	// Läs in de databaser som behövs
	function __autoload($class_name) {

        $class_file = '../classes/'.strtolower($class_name).'.class.php';

        if(file_exists($class_file)) {
            require_once($class_file);
        }
        else {
            return false;
        }

    }

	$output = ['error' => false];

	// tvätta det som kommer in
	$c = DB::clean($_GET);

	// kolla om det finns en film med motsvarande track
	$sql = "
	SELECT name, id 
	FROM tracks 
	WHERE project_key = ".$c['project_key']." 
	AND track_key = ".$c['track_key']." 
	AND online = 1
	ORDER BY id LIMIT 1";
	$track = DB::query($sql, true);
	$result['track_name'] = $track['name'];

	if(!$track) { 

		$output['error'] = 'Kan inte hitta filmen'; 
		echo json_encode($output); die;

	}

	$track_id = $track['id'];

	// kolla om användaren finns i databasen redan
	$sql = "SELECT id FROM respondents WHERE respondent_id = '".$c['respondent_id']."' AND track_id = ".$track_id." ORDER BY id LIMIT 1";
	$respondent = DB::query($sql, true);

	// om användaren inte finns så ska hens statistik in i databasen...
	if(!$respondent) {

		$api_key = Setting::getwritekey();
		$end_date = date('n-j-Y', time()+(60*60*24));

		$url = 'http://api.hapyak.com/api/reports/gradebook/users/answers?key='.$api_key.'&project='.$c['project_key'].'&track='.$c['track_key'].'&start=2015-06-01&end='.$end_date.'&gradebook_user='.$c['respondent_id'];

		// kortversion som också fungerar...
		// $url = 'http://api.hapyak.com/api/reports/gradebook/users/answers?key='.$api_key.'&start=2015-06-01&end='.$end_date.'&gradebook_user='.$c['respondent_id'];

		// hämta användaren data från hapyak
		$ra = DB::get_json($url);
		$username = $ra->users[0]->user->username;
		
		// eftersom vi bara vill ha in svarande med fullständiga resultat hämtar vi in alla frågorna
		$question_array = Question::get($track_id);
		$unfiltered_answered_questions = [];
		$answered_questions = [];

		// listan med de frågor användaren svarat på
		if(is_object($ra)) {
			$unfiltered_answered_questions = $ra->users[0]->tracks[0]->questions;
		}		

		// stäm av filmens frågor med de som användaren svarat på
		if(count($unfiltered_answered_questions) > 0) {
			foreach($unfiltered_answered_questions as $question) {
				$answered_questions[] = $question->question;
			}
		}

		// om det är rätt ska skillnaden vara noll och då kan vi spara ner uppgifterna
		$diff = array_diff($question_array, $answered_questions);
		if(count($diff) == 0) {
			
			// spara ner användaren
			$sql = "INSERT INTO respondents (respondent_id, track_id, username, online) VALUES ('".$c['respondent_id']."', ".$track_id.", '".$username."', 1, 1)";
			$respondent_id = DB::query($sql);
			foreach($unfiltered_answered_questions as $key => $question) {

				$question_id = array_search($question->question, $question_array);
				$answer_id = Answer::getId($question_id, $question->answer);
				$timestamp = strtotime($question->date);

				$sql = "
				SELECT * 
				FROM actions 
				WHERE respondent_id = ".$respondent_id." 
				AND question_id = ".$question_id." 
				AND answer_id = $answer_id
				";

				$is_already_answered = DB::query($sql);

				if(!$is_already_answered) {

					$sql = "
					INSERT INTO actions (
						respondent_id, 
						question_id, 
						answer_id, 
						timestamp) 
					VALUES (
						".$respondent_id.", 
						".$question_id.", 
						".$answer_id.", 
						".$timestamp."
					)";

					DB::query($sql);

				}

			}

		}
		// annars måste vi förklara för användaren att hen inte svarat på allt
		else {
			$output['error'] = 'Ofullständigt svar. Ditt resultat kan inte räknas'; 
			echo json_encode($output); die;
		}

	}

	// ...annars hämtar vi ut den
	else {
		$respondent_id = $respondent['id'];
	}

	$result['questions'] = Answer::getuseractions($respondent_id);

	echo json_encode($result);

	die;