<?php

	class Document {

		private $id, $info, $user;

		public function __construct($id) {

			$clean_project_id = DB::clean($id);

			$sql = "SELECT * FROM documents WHERE project_id = ".$clean_project_id;
			$data = DB::query($sql, true);

			//$user = new User($data['user_id']);

			$this->id 		= $data['id'];
			$this->info 	= $data['info'];
			//$this->user 	= $user;

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

		// Redigera befintligt projekt
		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);

			$output = [
				'title'		=> 'Redigera dokument',
				'project'	=> new Project($clean_input['id']),
				'users' 	=> User::get_all(),
				'document'	=> new Document($clean_input['id'])
			];

			return $output;
		}

		// Lista alla filmer som hör till ett projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function show($input = false) {
		
			$clean_input	= DB::clean($input);
			$project 		= new Project($clean_input['id']);

			$output = [
				'title'		=> $project->name,
				'project'	=> $project
			];

			return $output;

		}

		public static function save($input) {

			$clean_input = DB::clean($input);

			$sql = "INSERT INTO documents (project_id) VALUES (
				".$clean_input['project_id']."
			)";
			DB::query($sql);

		}

		public static function update($input) {

			$clean_input = DB::clean($input);

			$sql = "
			UPDATE documents SET 
			info = '".$clean_input['info']."'
			WHERE project_id = ".$clean_input['id'];

			DB::query($sql);

			$output = [
			'redirect_url' => $clean_input['redirect_url']
			];

			return $output;

		}

		public static function delete($input) {

			$clean_project_input = DB::clean($input['id']);
			
			// radera projekt
			$sql = "DELETE FROM documents WHERE project_id = ".$clean_project_input;
			DB::query($sql);

		}		

	}