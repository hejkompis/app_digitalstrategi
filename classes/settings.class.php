<?php

	class Settings {

		// Lägga till och ta bort specifika respondenter till en specifik film
		public static function edit($input) {
			$clean_input	= DB::clean($input);
			$sql = "SELECT * FROM settings";
			$data = DB::query($sql);

			$settings = [];
			foreach($data as $setting) {
				$settings[$setting['name']] = $setting['value'];
			}

			$output = [
				'title'		=> 'Inställningar',
				'settings' 	=> $settings,
				'email' 	=> gapi_email
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

		public static function update($input) {

			$clean_input	= DB::clean($input);

			$redirect_url = $clean_input['http_referer'];
			unset($clean_input['http_referer']);

			foreach($clean_input as $key => $value) {

				$sql = "
				UPDATE settings SET value = '".$value."' WHERE name = '".$key."'";
				DB::query($sql);

			}

			$output = [
			'redirect_url' => $redirect_url
			];

			return $output;

		}

		public static function getreadkey() {
			$sql = "SELECT value FROM settings WHERE name = 'api_read_key' LIMIT 1";
			$data = DB::query($sql, true);
			return $data['value'];
		}

		public static function getwritekey() {
			$sql = "SELECT value FROM settings WHERE name = 'api_write_key' LIMIT 1";
			$data = DB::query($sql, true);
			return $data['value'];
		}

	}