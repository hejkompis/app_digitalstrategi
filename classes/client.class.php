<?php

	class Client {

		private $id, $name, $user, $projects, $online;

		public function __construct($client_id) {

			$clean_client_id = DB::clean($client_id);

			$sql = "SELECT * FROM clients WHERE id = ".$clean_client_id;
			$data = DB::query($sql, true);

			$user = new User($data['user_id']);
			$projects = Project::get_all($clean_client_id);

			$this->id 		= $data['id'];
			$this->name 	= $data['name'];
			$this->user 	= $user;
			$this->online 	= $data['online'];
			$this->projects = $projects;

		}

		function __get($var) {
			if ($this->$var) {
				return $this->$var;
			}
		}

		function __isset($var) { 
			if ($this->$var) {
				return TRUE; 
			}
			return FALSE; 
		}

		public static function showlist($input = false) {

			$clean_input 	= DB::clean($input);
			$user 			= User::is_logged_in();

			if($user->admin && isset($clean_input['id'])) {
				$clients = self::get_all($clean_input['id']);
			}
			elseif($user->admin == false) {
				$clients = self::get_all($user->id);
			}
			else {
				$clients = self::get_all();
			}

			$output = [
				'title'		=> 'Kunder',
				'user' 		=> $user,
				'clients' 	=> $clients,
			];

			return $output;
		}

		// Lägga till nytt projekt
		public static function add($input = false) {
			$output = [
				'title'		=> 'Ny kund',
				'users'		=> User::get_all()
			];

			return $output;
		}

		// Redigera befintligt projekt
		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);

			$output = [
				'title'		=> 'Redigera kund',
				'client'	=> new Client($clean_input['id']),
				'users' 	=> User::get_all(),
			];

			return $output;
		}

		// Lista alla filmer som hör till ett projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function show($input = false) {
		
			$clean_input	= DB::clean($input);
			$client 		= new Client($clean_input['id']);

			$output = [
				'title'		=> $client->name,
				'client'	=> $client
			];

			return $output;
		}

		public static function get_all($user_id = false) {

			$sql_addon = '';

			if($user_id) {
				$clean_user_id = DB::clean($user_id);
				$sql_addon = " WHERE user_id = ".$clean_user_id." AND online = 1";
			}

			$sql = "SELECT id FROM clients ".$sql_addon." ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = new Client($value['id']);
			}

			return $output;

		}

		public static function save($input) {

			$clean_input = DB::clean($input);

			$sql = "INSERT INTO clients (name, user_id) VALUES (
				'".$clean_input['name']."', 
				".$clean_input['user_id']."
			)";
			$id = DB::query($sql);

			$output = [
				'redirect_url' => $clean_input['redirect_url']
			];

				return $output;

		}

		public static function update($input) {

			$clean_input = DB::clean($input);

			$sql = "
			UPDATE clients SET 
			name = '".$clean_input['name']."'
			WHERE id = ".$clean_input['id'];

			DB::query($sql);

			$output = [
			'redirect_url' => $clean_input['redirect_url']
			];

			return $output;

		}

		public static function delete($input) {

			$clean_id = DB::clean($input['id']);
			
			// radera projekt
			$sql = "DELETE FROM clients WHERE id = ".$clean_id;
			DB::query($sql);

			$output = ['redirect_url' => $input['http_referer']];

			return $output;

		}

		public static function json_changestatus($input) {

			$clean_input = DB::clean($input);
			$output = [];

			$sql = "SELECT online FROM clients WHERE id = ".$clean_input['id'];
			$data = DB::query($sql, true);

			$status = $data['online'] == 0 ? 1 : 0;

			$sql = "UPDATE clients SET online = ".$status." WHERE id = ".$clean_input['id'];
			$done = DB::query($sql);

			if($done) {
				$output['status'] = $status;
			}

			echo json_encode($output); die;

		}

		

	}