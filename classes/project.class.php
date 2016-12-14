<?php

	class Project {

		private $id, $name, $client, $accounts = [], $start_date, $end_date, $online;

		public function __construct($project_id) {

			$clean_project_id = DB::clean($project_id);

			$sql = "SELECT * FROM projects WHERE id = ".$clean_project_id;
			$data = DB::query($sql, true);

			$this->id 			= $data['id'];
			$this->name 		= $data['name'];
			$this->start_date 	= $data['start_date'];
			$this->end_date 	= $data['end_date'];
			$this->min_date		= date('Y-m-d', $data['start_date']);
			$this->max_date 	= $data['end_date'] > strtotime(date('Y-m-d')) ? date('Y-m-d') : date('Y-m-d', $data['end_date']);
			$this->online 		= $data['online'];
			$this->client 		= new Client($data['client_id']);
			$this->accounts		= Account::get_all($data['id']);

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

			$ga_accounts = [];
			$ga = new gapi(gapi_email, gapi_pass);

			$ga->requestAccountData();

			foreach($ga->getAccounts() as $key => $result) {

				$ga_accounts[$key]['name'] = $result;
				$ga_accounts[$key]['id'] = $result->getId();

				foreach($result->getProfiles() as $profile) {		
					$ga_accounts[$key]['profiles'][$profile['id']] = $profile['name'];
				}
			}

			$clients = Client::get_all();

			$output = [
				'title'			=> 'Nytt projekt',
				'client'		=> $client,
				'ga_accounts' 	=> $ga_accounts,
				'clients' 		=> $clients
			];

			return $output;
		}

		// Redigera befintligt projekt
		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);

			$ga_accounts = [];
			$ga = new gapi(gapi_email, gapi_pass);

			$ga->requestAccountData();

			foreach($ga->getAccounts() as $key => $result) {

				$ga_accounts[$key]['name'] = $result;
				$ga_accounts[$key]['id'] = $result->getId();

				foreach($result->getProfiles() as $profile) {		
					$ga_accounts[$key]['profiles'][$profile['id']] = $profile['name'];
				}
			}

			$clients = Client::get_all();

			$output = [
				'title'					=> 'Redigera projekt',
				'project'				=> new Project($clean_input['id']),
				'ga_accounts' 			=> $ga_accounts,
				'active_ga_accounts' 	=> Account::get_all_account_ids($clean_input['id']),
				'clients'				=> $clients

			];

			return $output;
		}

		// Lista alla filmer som hör till ett projekt (finns user_id i input så visas bara projekt för den specifika användaren)
		public static function show($input = false) {
		
			$clean_input	= DB::clean($input);
			$project 		= new Project($clean_input['id']);
			$client 		= new Client($project->client_id);
			$start_date		= isset($clean_input['from']) ? $clean_input['from'] : strtotime("-7 days");
			$end_date		= isset($clean_input['to']) ? $clean_input['to'] : date('Y-m-d', strtotime("-1 days"));
			$projects_ga_accounts 	= Account::get_all_account_ids($clean_input['id']);

			$ga = new gapi(gapi_email, gapi_pass);
			$ga->requestAccountData();

			$ga_summary = [
				'users' => [],
				'leads' => [],
				'users_total' => 0,
				'leads_total' => 0
			];

			$ga_weekly_summary = [
				'users' => [],
				'leads' => []
			];

			$colours = [
				'75,192,192',
				'255,182,0',
				'0,204,255',
				'255,128,64',
				'204,55,20',
				'61,86,153',
				'110,178,9',
				'129,204,20',
				'255,69,25'
			];

			$count = 0;

			// get raw data regarding connected accounts from ga
			$connected_views = Account::get_connected_views();

			foreach($projects_ga_accounts as $ga_account) {

				$dimensions = array('date');
				$metrics = array('users', 'goalCompletionsAll');
				$sort_metric = array('date'); 
				$filter = null;
				$start_index = 1;
				$max_results = 10000;

				$ga_span = $ga;
				$ga_total = $ga;

				$ga_span->requestReportData(
					$ga_account, 
					$dimensions, 
					$metrics, 
					$sort_metric, 
					$filter, 
					$start_date, 
					$end_date, 
					$start_index, 
					$max_results
				);

				if(array_key_exists($ga_account,$connected_views)) {
						
					$ga_span_results[$ga_account]['name'] = $connected_views[$ga_account]['name'];
					$ga_span_results[$ga_account]['url'] = $connected_views[$ga_account]['url'];

					$ga_total_results[$ga_account]['name'] = $connected_views[$ga_account]['name'];
					$ga_total_results[$ga_account]['url'] = $connected_views[$ga_account]['url']; 			
				}

				
				$ga_span_results[$ga_account]['colour'] = $colours[$count];
				$ga_total_results[$ga_account]['colour'] = $colours[$count];
				$count++;

				foreach($ga_span->getResults() as $res) {
					$ga_span_results[$ga_account]['users'][strtotime($res->getDate())] = $res->getUsers();
					$ga_span_results[$ga_account]['leads'][strtotime($res->getDate())] = $res->getGoalCompletionsAll();

					$ga_summary['users'][strtotime($res->getDate())] = isset($ga_summary['users'][strtotime($res->getDate())]) ? $ga_summary['users'][strtotime($res->getDate())] + $res->getUsers() : $res->getUsers();
					$ga_summary['leads'][strtotime($res->getDate())] = isset($ga_summary['leads'][strtotime($res->getDate())]) ? $ga_summary['leads'][strtotime($res->getDate())] + $res->getGoalCompletionsAll() : $res->getGoalCompletionsAll();

				}

				$ga_total->requestReportData(
					$ga_account, 
					$dimensions, 
					$metrics, 
					$sort_metric, 
					$filter, 
					date('Y-m-d', $project->start_date), 
					$end_date, 
					$start_index, 
					$max_results
				);

				foreach($ga_total->getResults() as $res) {

					$dayNo = date('N', strtotime($res->getDate()));
					$weekNo = date('W', strtotime($res->getDate()));

					$day_where_weekly_count_starts = 5;
					$leads_per_users = 0.05;

					// om det är fredag, lördag eller söndag
					if($dayNo >= $day_where_weekly_count_starts) {

						$ga_total_results[$ga_account]['users_per_week'][$weekNo+1] = isset($ga_total_results[$ga_account]['users_per_week'][$weekNo+1]) ? $ga_total_results[$ga_account]['users_per_week'][$weekNo+1] + $res->getUsers() : $res->getUsers();

						$ga_weekly_summary['users'][$weekNo+1] = isset($ga_weekly_summary['users'][$weekNo+1]) ? $ga_weekly_summary['users'][$weekNo+1] + $res->getUsers() : $res->getUsers();

						$ga_total_results[$ga_account]['leads_per_week'][$weekNo+1] = isset($ga_total_results[$ga_account]['leads_per_week'][$weekNo+1]) ? $ga_total_results[$ga_account]['leads_per_week'][$weekNo+1] + $res->getGoalCompletionsAll() : $res->getGoalCompletionsAll();

						$ga_weekly_summary['leads'][$weekNo+1] = isset($ga_weekly_summary['leads'][$weekNo+1]) ? $ga_weekly_summary['leads'][$weekNo+1] + $res->getGoalCompletionsAll() : $res->getGoalCompletionsAll();

					}
					else {

						$ga_total_results[$ga_account]['users_per_week'][$weekNo] = isset($ga_total_results[$ga_account]['users_per_week'][$weekNo]) ? $ga_total_results[$ga_account]['users_per_week'][$weekNo] + $res->getUsers() : $res->getUsers();

						$ga_total_results[$ga_account]['leads_per_week'][$weekNo] = isset($ga_total_results[$ga_account]['leads_per_week'][$weekNo]) ? $ga_total_results[$ga_account]['leads_per_week'][$weekNo] + $res->getGoalCompletionsAll() : $res->getGoalCompletionsAll();
					}
				}

			}

			$dates = [];
			$weeks = [];

			foreach(array_values($ga_span_results)[0]['users'] as $key => $value) {
				$dates[] = $key;
			}

			foreach(array_values($ga_total_results)[0]['users_per_week'] as $key => $value) {
				$weeks[] = $key;
			}

			$output = [
				'title'				=> $client->name.', '.$project->name,
				'project'			=> $project,
				'client' 			=> $client,
				'dates'	 			=> $dates,
				'weeks' 			=> $weeks,
				'ga_results' 		=> $ga_span_results,
				'ga_total_results' 	=> $ga_total_results,
				'ga_summary' 		=> $ga_summary,
				'ga_weekly_summary' => $ga_weekly_summary
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
			$end_date = $clean_input['ned_date'] != '' ? strtotime($clean_input['end_date']) : strtotime(date('Y-m-d', strtotime("+30 days")));

			$sql = "INSERT INTO projects (name, client_id) VALUES (
				'".$clean_input['name']."', 
				".$clean_input['client_id']."
			)";
			$id = DB::query($sql);

			foreach($clean_input['ga_accounts'] as $ga_account) {
				$sql = "INSERT INTO accounts (project_id, ga_account_id, start_date, end_date) VALUES (
					".$id.", 
					".$ga_account.",
					".$start_date.",
					".$end_date."
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
			Account::delete($clean_input['id']);

			$start_date = isset($clean_input['start_date']) ? strtotime($clean_input['start_date']) : strtotime(date('Y-m-d'));
			$end_date = $clean_input['ned_date'] != '' ? strtotime($clean_input['end_date']) : strtotime(date('Y-m-d', strtotime("+30 days")));

			$sql = "
			UPDATE projects SET 
			name = '".$clean_input['name']."',
			client_id = '".$clean_input['client_id']."',
			start_date = ".$start_date.",
			end_date = ".$end_date."
			WHERE id = ".$clean_input['id'];

			DB::query($sql);

			foreach($clean_input['ga_accounts'] as $ga_account) {
				$sql = "INSERT INTO accounts (project_id, ga_account_id) VALUES (
					".$clean_input['id'].", 
					".$ga_account."
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