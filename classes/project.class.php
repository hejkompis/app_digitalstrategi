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
			$this->report_from		= $data['report_from'];
			$this->report_to		= $data['report_to'];
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

			$current_user 	= User::is_logged_in();

			if(!in_array($project->client->id, $current_user->user_has_access) && !$current_user->admin) {
				header('Location: /project/showlist/');
				die;
			}

			// Vi sätter compare-värdena till false så de finns med från början
			$compare_from = false;
			$compare_to = false;

			// report är veckorna som listas
			$report_from_day = $project->report_from;
			$report_to_day = $project->report_to;
			$today = strtotime('today');
			$today_is_day = date('w', $today);

			switch ($report_to_day) {
				case 0:
					$report_to_string = 'Last Sunday';
					break;
				case 1:
					$report_to_string = 'Last Monday';
					break;
				case 2:
					$report_to_string = 'Last Tuesday';
					break;
				case 3:
					$report_to_string = 'Last Wednesday';
					break;
				case 4:
			        $report_to_string = 'Last Thursday';
			        break;
			    case 5:
			        $report_to_string = 'Last Friday';
			        break;
			    case 6:
			        $report_to_string = 'Last Saturday';
			        break;
			}

			$report_to = strtotime($report_to_string);
			$report_from = $report_to;
			do {
				$report_from -= (60*60*24);
				$d = date('w', $report_from);
			} while ($d != $report_from_day);

			// finns inga värden att jämföra med tar vi bort strängarna för compare från url:en
			if(isset($clean_input['compare_from']) && $clean_input['compare_from'] == '') {
				header('Location: /project/show/?id='.$clean_input['id'].'&from='.$clean_input['from'].'&to='.$clean_input['to']);
				die;
			}
			// annars gör vi om dem till unix-timestamp
			elseif(isset($clean_input['compare_from']) && $clean_input['compare_from'] != '') {

				$compare_from = strtotime($clean_input['compare_from']);
				$compare_to = strtotime($clean_input['compare_to']);
				$comparison = true;

			}
			// alternativt sätter comparison till false
			else {
				$comparison = false;
			}

			// sätter ett värde att börja visa data från
			$from = isset($clean_input['from']) ? strtotime($clean_input['from']) : $report_from;

			// sätter ett värde att sluta visa data på
			if(isset($clean_input['to'])) {
				$to = strtotime($clean_input['to']);
			} else {
				$to = $report_to;
			}

			// tar reda på alla datum mellan from och to
			$dates = [];
			for($i = $from; $i <= $to; $i+=(60*60*24)) {
				$dates[] = $i;
			}

			// dimensioner
			$dimensions 		= self::get_project_dimensions($project->id);

			// hämtar in alla konton kopplade till projektet och filtrerar på datum
			$accounts 		= self::get_project_accounts($project->id);
			$accounts 		= Account::filter_account_data($accounts, $from, $to);

			// skapar rapportperioder baserat på veckor
			$reports = self::get_project_accounts($project->id);
			$report_start_date 	= $project->start_date;
			if($project->end_date >= strtotime('today') || $project->end_date === NULL) {
				$report_end_date = strtotime('yesterday');
			} 
			else {
				$report_end_date = $project->end_date;
			}
			$reports = Account::filter_account_data($reports, $report_start_date, $report_end_date);
			$report_weeks = Account::get_report_weeks($reports, $report_from_day, $report_to_day);
			$reports = Account::get_data_in_reports($reports, $report_from_day, $report_to_day);	

			$total_by_day	= Account::get_total_by_day($accounts);
			$total_summary	= Account::get_total_summary($accounts);

			$comparison_dates = [];
			$comparison_total_by_day = [];
			$comparison_total_summary = [];

			// comparison dates
			if($comparison) {

				$comparison = self::get_project_accounts($project->id);
				$comparison = Account::filter_account_data($comparison, $compare_from, $compare_to);

				$comparison_total_by_day 	= Account::get_total_by_day($comparison);
				$comparison_total_summary 	= Account::get_total_summary($comparison);
				
				for($i = $compare_from; $i <= $compare_to; $i+=(60*60*24)) {
					$comparison_dates[] = $i;
				}
			}
			
			// echo '<pre>';
			// print_r($accounts);
			// echo '</pre>';
			// die;
			
			$maxDate = $project->end_date > strtotime('yesterday') ? strtotime('yesterday') : $project->end_date;

			$output = [
				'title'					=> $project->name.' - '.$project->client->name,
				'project'				=> $project,
				'accounts'				=> $accounts,
				'total'					=> $total_by_day,
				'summary' 				=> $total_summary,
				'from'					=> $from,
				'to' 					=> $to,
				'maxDate' 				=> $maxDate,
				'dates'					=> $dates,
				'comparison' 			=> $comparison,
				'comparison_total'		=> $comparison_total_by_day,
				'comparison_summary' 	=> $comparison_total_summary,
				'compare_from'			=> $compare_from,
				'compare_to' 			=> $compare_to,
				'comparison_dates' 		=> $comparison_dates,
				'reports'				=> $reports,
				'report_weeks'			=> $report_weeks,
				'dimensions'			=> $dimensions
			];

			return $output;
		}

		public static function showlist($input = false) {

			$clean_input 	= DB::clean($input);
			$user 			= User::is_logged_in();
			$view_user 		= false;

			if($user->admin) {
				$projects = self::get_all();
			}
			if($user->admin && isset($input['id'])) {

				$clean_id = DB::clean($input['id']);
				$view_user = new User($clean_id);
				if(!$view_user->admin) {
					$projects = self::get_all($view_user->user_has_access);	
				}
				else {
					$projects = self::get_all();
				}
				
			}
			elseif($user->admin == false) {
				$projects = self::get_all($user->user_has_access);
			}

			$output = [
				'title'		=> 'Projekt',
				'user' 		=> $user,
				'view_user' => $view_user,
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
				'clients' 		=> $clients,
				'dimensions' 	=> Dimension::get_all()
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
				'clients'				=> $clients,
				'dimensions' 			=> Dimension::get_all(),
				'project_has_dimensions' 	=> self::project_has_dimensions($clean_input['id']),
			];

			return $output;
		}

		public static function get_all($client_array = false) {

			$sql_addon = '';

			if($client_array) {

				$current_clients = "";
				foreach($client_array as $client_id) {
					$current_clients .= $client_id.",";
				}

				$current_clients = trim($current_clients, ',');

				$sql_addon = " WHERE client_id IN(".$current_clients.") AND online = 1";
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

			$sql = "INSERT INTO projects (name, client_id, start_date, end_date, report_from, report_to, conversion_rate) VALUES (
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

			foreach($clean_input['project_has_dimensions'] as $dimension_id) {
				$sql = "INSERT INTO project_has_dimensions (project_id, dimension_id) VALUES (
					".$id.", 
					".$dimension_id."
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
			report_from = ".$clean_input['report_from'].",
			report_to = ".$clean_input['report_to'].",
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

			$sql = "DELETE FROM project_has_dimensions WHERE project_id = ".$clean_input['id']."";
			DB::query($sql);

			foreach($clean_input['project_has_dimensions'] as $dimension_id) {
				$sql = "INSERT INTO project_has_dimensions (project_id, dimension_id) VALUES (
					".$clean_input['id'].", 
					".$dimension_id."
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

		public static function project_has_dimensions($project_id) {

			$clean_project_id = DB::clean($project_id);

			$sql = "SELECT dimension_id FROM project_has_dimensions WHERE project_id = ".$clean_project_id;
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = $value['dimension_id'];
			}

			return $output;

		}

		public static function get_project_dimensions($project_id) {

			$clean_project_id = DB::clean($project_id);

			$dimensions = self::project_has_dimensions($clean_project_id);

			$output = [];
			foreach($dimensions as $value) {
				$output[] = new Dimension($value);
			}

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