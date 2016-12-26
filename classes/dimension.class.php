<?php

	class Dimension {

		private $id, $name, $dimension_name, $projects, $online;

		public function __construct($client_id) {

			$clean_client_id = DB::clean($client_id);

			$sql = "SELECT * FROM dimensions WHERE id = ".$clean_client_id;
			$data = DB::query($sql, true);

			$this->id 				= $data['id'];
			$this->dimension_name 	= $data['dimension_name'];
			$this->name 			= $data['name'];
			$this->online 			= $data['online'];

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

			$dimensions = self::get_all();

			$output = [
				'title'		 => 'Dimensioner',
				'user' 		 => $user,
				'dimensions' => $dimensions
			];

			return $output;
		}

		// Lägga till nytt projekt
		public static function add($input = false) {
			$output = [
				'title'		=> 'Ny dimension'
			];

			return $output;
		}

		// Redigera befintligt projekt
		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);

			$output = [
				'title'		=> 'Redigera dimension',
				'dimension'	=> new Dimension($clean_input['id'])
			];

			return $output;
		}

		public static function get_all() {

			$sql = "SELECT id FROM dimensions ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = new Dimension($value['id']);
			}

			return $output;

		}

		public static function save($input) {

			$clean_input = DB::clean($input);

			$sql = "INSERT INTO dimensions (name, dimension_name) VALUES (
				'".$clean_input['name']."',
				'".$clean_input['dimension_name']."'
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
			UPDATE dimensions SET 
			name = '".$clean_input['name']."',
			dimension_name = '".$clean_input['dimension_name']."'
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
			$sql = "DELETE FROM dimensions WHERE id = ".$clean_id;
			DB::query($sql);

			$output = ['redirect_url' => $input['http_referer']];

			return $output;

		}

		public static function json_changestatus($input) {

			$clean_input = DB::clean($input);
			$output = [];

			$sql = "SELECT online FROM dimensions WHERE id = ".$clean_input['id'];
			$data = DB::query($sql, true);

			$status = $data['online'] == 0 ? 1 : 0;

			$sql = "UPDATE dimensions SET online = ".$status." WHERE id = ".$clean_input['id'];
			$done = DB::query($sql);

			if($done) {
				$output['status'] = $status;
			}

			echo json_encode($output); die;

		}

		

	}