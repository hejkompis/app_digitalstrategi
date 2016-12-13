<?php

	class Dashboard {

		/***
		/*
		/* GENERAL
		/*
		/**/

		// Lista för alla projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function fallback($input = false) {
			$user = User::is_logged_in();
			if($user->admin) {
				return self::listusers();
			}
			else {
				return self::listprojects();
			}
		}

		// Logga in om du inte är inloggad
		public static function login($input = false) {
			$clean_input = DB::clean($input);

			$output = [
				'no_login_check' => true,
				'title' => 'Logga in',
				'data'	=> $clean_input
			];
			return $output;
		}

		// Beställ återställning av lösenord
		public static function getpassword($input = false) {
			$clean_input = DB::clean($input);

			$output = [
				'no_login_check' => true,
				'title' => 'Glömt lösenord',
				'data'	=> $clean_input
			];
			return $output;
		}

		// Beställ återställning av lösenord
		public static function setpassword($input = false) {
			$clean_input = DB::clean($input);

			$output = [
				'no_login_check' => true,
				'title' => 'Återställ lösenord',
				'data'	=> $clean_input
			];
			return $output;
		}

		/***
		/*
		/* USERS
		/*
		/**/

		// Visa alla användare i en lista
		public static function listusers($input = false) {
			$output = [
				'title' => 'Användare',
				'users'	=> User::get_all(),
				'page' 	=> 'dashboard.listusers.twig'
				];
			return $output;
		}

		public static function adduser($input = false) {
			$output = ['title' => 'Skapa ny användare'];
			return $output;
		}

		public static function edituser($input = false) {

			$clean_input 	= DB::clean($input);
			$user 			= isset($clean_input['id']) ? new User($clean_input['id']) : User::is_logged_in();
			
			$output = [
				'title' => 'Redigera användare',
				'user' 	=> $user
			];
			return $output;
		}

		/***
		/*
		/* PROJECTS
		/*
		/**/

		// Lista för alla projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function listprojects($input = false) {

			$clean_input 	= DB::clean($input);
			$user 			= User::is_logged_in();

			if($user->admin && isset($clean_input['id'])) {
				$projects = Project::get_all($clean_input['id']);
			}
			elseif($user->admin == false) {
				$projects = Project::get_all($user->id);
			}
			else {
				$projects = Project::get_all();
			}

			$output = [
				'title'		=> 'Projekt',
				'user' 		=> $user,
				'projects' 	=> $projects,
				'page' 	=> 'dashboard.listprojects.twig'
			];

			return $output;
		}

		// Lägga till nytt projekt
		public static function addproject($input = false) {
			$output = [
				'title'		=> 'Nytt projekt',
				'users' 	=> User::get_all(),
			];

			return $output;
		}

		// Redigera befintligt projekt
		public static function editproject($input = false) {

			$clean_input 	= DB::clean($input);

			$output = [
				'title'		=> 'Nytt projekt',
				'project'	=> new Project($clean_input['id']),
				'tracks'	=> Track::get_all(),
				'users' 	=> User::get_all(),
			];

			return $output;
		}

		// Lista alla filmer som hör till ett projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function showproject($input = false) {
		
			$clean_input	= DB::clean($input);
			$project 		= new Project($clean_input['id']);

			$output = [
				'title'		=> 'Filmer för '.$project->name,
				'project'	=> $project
			];

			return $output;
		}

		/***
		/*
		/* TRACKS
		/*
		/**/

		// Lista för alla filmer (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function listtracks($input = false) {

			$clean_input	= DB::clean($input);
			$user 			= isset($clean_input['id']) ? User::get($clean_input['id']) : false;
			$tracks 		= isset($clean_input['id']) ? Track::get_all($clean_input['id']) : Track::get_all();

			$output = [
				'title'		=> 'Filmer',
				'user' 		=> $user,
				'tracks' 	=> $tracks
			];

			return $output;
		}

		// Lägga till ny film för ett projekt
		public static function addtrack($input = false) {

			$clean_input = DB::clean($input);

			$project = isset($clean_input['id']) ? new Project($clean_input['id']) : false;

			$output = [
				'title' 	=> 'Lägg till film',
				'project' 	=> $project
			];
			return $output;
		}

		// Redigera befintlig film för ett projekt
		public static function edittrack($input = false) {

			$clean_input	= DB::clean($input);
			$track 			= new Track($clean_input['id']);

			$output = [
				'title' => 'Redigera film',
				'track' => $track
			];

			return $output;
		}

		// Visa statistik som hör till en specifik film
		public static function showtrack($input = false) {
			$clean_input	= DB::clean($input);
			$track 			= new Track($clean_input['id']);

			$output = [
				'title'		=> 'Översikt',
				'track' 	=> $track
			];

			return $output;
		}

		/***
		/*
		/* RESPONDENTS
		/*
		/**/

		// Visa statistik som hör till en specifik film
		public static function showrespondents($input = false) {
			$clean_input	= DB::clean($input);
			$track 			= new Track($clean_input['id']);

			$output = [
				'title'		=> 'Respondenter',
				'track' 	=> $track
			];

			return $output;
		}

		// Visa statistik som hör till en specifik film
		public static function showrespondent($input = false) {
			$clean_input	= DB::clean($input);
			$respondent 	= new Respondent($clean_input['id']);

			$output = [
				'title'		=> 'Respondent',
				'respondent' 	=> $respondent
			];

			return $output;
		}

		// Lägga till och ta bort specifika respondenter till en specifik film
		public static function showspecificrespondents($input) {
			$clean_input	= DB::clean($input);
			$track 		 	= new Track($clean_input['id']);

			$output = [
				'title'		=> 'Specifika respondenter',
				'track' 	=> $track
			];

			return $output;
		}

		// Lägga till och ta bort specifika respondenter till en specifik film
		public static function addspecificrespondent($input) {
			$clean_input	= DB::clean($input);
			$track 		 	= new Track($clean_input['id']);

			$output = [
				'title'		=> 'Lägg till specifik respondent',
				'track' 	=> $track
			];

			return $output;
		}

		/***
		/*
		/* INSTÄLLNINGAR
		/*
		/**/

		// Lägga till och ta bort specifika respondenter till en specifik film
		public static function editsettings($input) {
			$clean_input	= DB::clean($input);
			$sql = "SELECT * FROM settings";
			$data = DB::query($sql);

			$settings = [];
			foreach($data as $setting) {
				$settings[$setting['name']] = $setting['value'];
			}

			$output = [
				'title'		=> 'Lägg till specifik respondent',
				'settings' 	=> $settings
			];

			return $output;
		}

		// Lista för alla filmer (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function editcron($input = false) {

			$clean_input	= DB::clean($input);
			$tracks 		= Track::get_all();

			$output = [
				'title'		=> 'Automatiska uppdateringar',
				'tracks' 	=> $tracks
			];

			return $output;
		}

	}