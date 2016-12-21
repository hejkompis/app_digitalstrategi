<?php

	class Project {

		private $id, $name, $client, $accounts = [], $start_date, $end_date, $conversion_rate, $online;

		public function __construct($project_id) {

			$clean_project_id = DB::clean($project_id);

			$sql = "SELECT * FROM projects WHERE id = ".$clean_project_id;
			$data = DB::query($sql, true);

			$this->id 				= $data['id'];
			$this->name 			= $data['name'];
			$this->start_date 		= $data['start_date'];
			$this->end_date 		= $data['end_date'];
			$this->conversion_rate 	= $data['conversion_rate'];
			$this->online 			= $data['online'];
			$this->client 			= new Client($data['client_id']);
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

		// Lista alla filmer som hör till ett projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function show($input = false) {
		
			$clean_input	= DB::clean($input);
			$project 		= new Project($clean_input['id']);

			$from = isset($clean_input['from']) ? strtotime($clean_input['from']) : $project->start_date;

			$to = $project->end_date;
			if($to > time() || $to === NULL) {
				$to = strtotime('yesterday');
			}
			if(isset($clean_input['to'])) {
				$to = strtotime($clean_input['to']);
			}

			$dates = [];
			for($i = $from; $i <= $to; $i+=(60*60*24)) {
				$dates[] = $i;
			}

			$raw_accounts 	= self::get_project_accounts($project->id);
			$accounts 		= Account::filter_account_data($raw_accounts, $from, $to);
			$total_by_day	= Account::get_total_by_day($accounts);
			$total_summary	= Account::get_total_summary($accounts);

			// echo '<pre>';
			// 	print_r($total_by_day);
			// echo '</pre>';

			$output = [
				'title'		=> $project->name.' - '.$project->client->name,
				'project'	=> $project,
				'accounts'	=> $accounts,
				'total'		=> $total_by_day,
				'summary' 	=> $total_summary,
				'from'		=> $from,
				'to' 		=> $to,
				'dates'		=> $dates
			];

			return $output;
		}

		public static function showlist($input = false) {

			$clean_input 	= DB::clean($input);
			$user 			= User::is_logged_in();

			if($user->admin && isset($clean_input['id'])) {
				$projects = self::get_all($clean_input['id']);
			}
			elseif($user->admin == false) {
				$projects = self::get_all($user->id);
			}
			else {
				$projects = self::get_all();
			}

			$output = [
				'title'		=> 'Projekt',
				'user' 		=> $user,
				'projects' 	=> $projects,
				'page' 	=> 'project.showlist.twig'
			];

			return $output;
		}

		// Lägga till nytt projekt
		public static function add($input = false) {

			$clean_input = DB::Clean($input);

			$client = isset($clean_input['id']) ? new Client($clean_input['id']) : false;

			

			$clients = Client::get_all();

			$output = [
				'title'			=> 'Nytt projekt',
				'client'		=> $client,
				'accounts' 		=> Account::get_all(),
				'clients' 		=> $clients
			];

			return $output;
		}

		// Redigera befintligt projekt
		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);
			$clients = Client::get_all();
			$project = new Project($clean_input['id']);
			$output = [
				'title'					=> 'Redigera projekt',
				'project'				=> $project,
				'project_has_accounts' 	=> self::project_has_accounts($clean_input['id']),
				'accounts' 				=> Account::get_all(),
				'clients'				=> $clients

			];

			return $output;
		}

		public static function get_all($client_id = false) {

			$sql_addon = '';

			/*if($client_id) {

				// för icke-admin, typ, funkar nästan
				$clean_client_id = DB::clean($client_id);

				$sql = "SELECT id FROM clients WHERE user_id = ".$client_id;
				$data = DB::query($sql);

				$current_clients = "";
				foreach($data as $client) {
					$current_clients .= $client['id'].",";
				}

				$current_clients = trim($current_clients, ',');

				$sql_addon = " WHERE client_id IN(".$current_clients.")";
			}*/

			if($client_id) {

				// funkar ej om du ej är admin
				$clean_client_id = DB::clean($client_id);
				$sql_addon = " WHERE client_id = ".$clean_client_id;
			}

			$sql = "SELECT id FROM projects ".$sql_addon." ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = new Project($value['id']);
			}

			return $output;

		}

		public static function save($input) {

			$clean_input = DB::clean($input);

			$start_date = $clean_input['start_date'] != '' ? strtotime($clean_input['start_date']) : strtotime(date('Y-m-d'));
			$end_date = $clean_input['end_date'] != '' ? strtotime($clean_input['end_date']) : 'NULL';

			$sql = "INSERT INTO projects (name, client_id, start_date, end_date, conversion_rate) VALUES (
				'".$clean_input['name']."', 
				".$clean_input['client_id'].",
				".$start_date.",
				".$end_date.",
				".$clean_input['conversion_rate']."
			)";
			$id = DB::query($sql);

			foreach($clean_input['project_has_accounts'] as $account_id) {
				$sql = "INSERT INTO project_has_accounts (project_id, account_id) VALUES (
					".$id.", 
					".$account_id."
				)";
				DB::query($sql);
			}

			$output = [
				'redirect_url' => $clean_input['redirect_url']
			];

				return $output;

		}

		public static function update($input) {

			$clean_input = DB::clean($input);

			$start_date = isset($clean_input['start_date']) ? strtotime($clean_input['start_date']) : strtotime(date('Y-m-d'));
			$end_date = $clean_input['end_date'] != '' ? strtotime($clean_input['end_date']) : 'NULL';

			$sql = "
			UPDATE projects SET 
			name = '".$clean_input['name']."',
			client_id = '".$clean_input['client_id']."',
			start_date = ".$start_date.",
			end_date = ".$end_date.",
			conversion_rate = ".$clean_input['conversion_rate']."
			WHERE id = ".$clean_input['id'];

			DB::query($sql);

			$sql = "DELETE FROM project_has_accounts WHERE project_id = ".$clean_input['id']."";
			DB::query($sql);

			foreach($clean_input['project_has_accounts'] as $account_id) {
				$sql = "INSERT INTO project_has_accounts (project_id, account_id) VALUES (
					".$clean_input['id'].", 
					".$account_id."
				)";
				DB::query($sql);
			}

			$output = [
			'redirect_url' => $clean_input['redirect_url']
			];

			return $output;

		}

		public static function delete($input) {

			$clean_id = DB::clean($input['id']);
			
			// radera projekt
			$sql = "DELETE FROM projects WHERE id = ".$clean_id;
			DB::query($sql);

			$output = ['redirect_url' => $input['http_referer']];

			return $output;

		}

		public static function project_has_accounts($project_id) {

			$clean_project_id = DB::clean($project_id);

			$sql = "SELECT account_id FROM project_has_accounts WHERE project_id = ".$clean_project_id;
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = $value['account_id'];
			}

			return $output;

		}

		public static function get_project_accounts($project_id) {

			$clean_project_id = DB::clean($project_id);

			$accounts = self::project_has_accounts($clean_project_id);

			$output = [];
			foreach($accounts as $value) {
				$output[] = new Account($value);
			}

			return $output;

		}

		public static function json_changestatus($input) {

			$clean_input = DB::clean($input);
			$output = [];

			$sql = "SELECT online FROM projects WHERE id = ".$clean_input['id'];
			$data = DB::query($sql, true);

			$status = $data['online'] == 0 ? 1 : 0;

			$sql = "UPDATE projects SET online = ".$status." WHERE id = ".$clean_input['id'];
			$done = DB::query($sql);

			if($done) {
				$output['status'] = $status;
			}

			echo json_encode($output); die;

		}

		

	}