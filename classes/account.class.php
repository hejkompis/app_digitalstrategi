<?php

	class Account {

		private $id, $ga_uid, $ga_account_id, $ga_view_id, $name, $colour, $online, $data, $summary;

		public function __construct($account_id) {

			$clean_account_id = DB::clean($account_id);

			$sql = "SELECT * FROM accounts WHERE id = ".$clean_account_id;
			$data = DB::query($sql, true);

			$this->id 				= $data['id'];
			$this->ga_uid 			= $data['ga_property_id'];
			$this->ga_account_id 	= $data['ga_account_id'];
			$this->ga_view_id 		= $data['ga_view_id'];
			$this->name 			= $data['name'];
			$this->colour 			= $data['colour'];
			$this->online 			= $data['online'];
			$this->data 			= self::get_stored_data($data['ga_view_id']);

			// echo '<pre>';
			// 	print_r($this->data);
			// echo '</pre>';

			// die;

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
				$accounts = self::get_all($clean_input['id']);
			}
			elseif($user->admin == false) {
				$accounts = self::get_all($user->id);
			}
			else {
				$accounts = self::get_all();
			}

			$output = [
				'title'		=> 'Konton',
				'user' 		=> $user,
				'accounts' 	=> $accounts,
			];

			return $output;
		}

		// Lägga till nytt konto
		public static function add($input = false) {
			$output = [
				'title'		=> 'Nytt konto',
				'views' 	=> self::get_connected_views()
			];

			return $output;
		}

		public static function save($input) {

			$clean_input = DB::clean($input);

			// echo '<pre>';
			// 	echo $clean_input['view_id'].'<br /><br />';
			// 	foreach($dimensions as $dimension) {
			// 		print_r($ga->requestReportData($clean_input['view_id'], array($dimension,'date'), $metrics));
			// 	}
			// echo '</pre>';

			// die;
			// 
			$colour = substr($clean_input['colour'], 4, -1);

			$sql = "INSERT INTO accounts (ga_account_id, ga_view_id, name, colour) VALUES (
				'".$clean_input['view_id']."', 
				'".$clean_input['view_id']."',
				'".$clean_input['name']."',
				'".$colour."'
			)";
			$id = DB::query($sql);

			self::store_data($clean_input['view_id']);

			$output = [
			'redirect_url' => $clean_input['redirect_url']
			];

			return $output;

		}

		// Redigera befintligt konto
		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);
			$account 		= new Account($clean_input['id']);
			$stored_data 	= self::get_stored_data($account->ga_account_id);

			$output = [
				'title'		=> 'Redigera konto',
				'account'	=> $account,
				'views' 	=> self::get_connected_views()
			];

			return $output;
		}

		public static function update($input) {

			$clean_input = DB::clean($input);
			$colour = substr($clean_input['colour'], 4, -1);

			$sql = "
			UPDATE accounts SET 
			name = '".$clean_input['name']."',
			colour = '".$colour."',
			ga_account_id = '".$clean_input['view_id']."',
			ga_view_id = '".$clean_input['view_id']."'
			WHERE id = ".$clean_input['id'];

			DB::query($sql);

			self::store_data($clean_input['view_id']);

			$output = [
				'redirect_url' => $clean_input['redirect_url']
			];

			return $output;

		}

		public static function delete($input) {

			$clean_id = DB::clean($input['id']);
			
			// radera projekt
			$sql = "DELETE FROM accounts WHERE id = ".$clean_id;
			DB::query($sql);

			$output = ['redirect_url' => $input['http_referer']];

			return $output;

		}

		public static function get_all() {

			$sql_addon = '';

			$sql = "SELECT id, name FROM accounts ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $key => $value) {
				$output[$key]['id'] = $value['id'];
				$output[$key]['name'] = $value['name'];
			}

			return $output;

		}

		private static function store_data($view_id) {

			$clean_view_id = DB::clean($view_id);

			// $dimensions = [
			// 	//'date',
			// 	'source',
			// 	'medium',
			// 	'sourceMedium',
			// 	'campaign',
			// 	'adMatchedQuery',
			// 	'searchKeyword',
			// 	'referralPath',
			// 	'fullReferrer',
			// 	'socialNetwork',
			// 	'adPlacementDomain',
			// 	'browser',
			// 	//'browserVersion',
			// 	'operatingSystem',
			// 	'mobileDeviceInfo',
			// 	'mobileDeviceBranding',
			// 	'deviceCategory',
			// 	'country',
			// 	'region',
			// 	//'metro',
			// 	'city',
			// 	//'latitude',
			// 	//'longitude',
			// 	'userAgeBracket',
			// 	'userGender'
			// ];
			
			$dimensions = Dimension::get_all();

			$metrics = [
				'users',
				'sessions',
				'pageviews',
				'goalCompletionsAll',
				'bounces',
				'bounceRate',
				'organicSearches'
			];

			$today = date('Y-m-d', time());

			$ga_to_store = [];

			$ga = new gapi(gapi_email, gapi_pass);

			$sql = "DELETE FROM account_data WHERE view_id = $clean_view_id AND stored_date < '$today'";
			DB::query($sql);

			// just date
			$ga_object = $ga->requestReportData($clean_view_id, array('date'), $metrics);

			foreach($ga_object as $o_key => $value) {
				$ga_to_store['date'][$o_key]['dimensions'] = serialize($value->getDimensions());
				$ga_to_store['date'][$o_key]['metrics'] = serialize($value->getMetrics());
				$ga_to_store['date'][$o_key]['data_date'] = null !== $value->getDate() ? strtotime($value->getDate()) : '';
			}

			// date combined with all other dimensions
			foreach($dimensions as $d_key => $dimension) {
				$ga_object = $ga->requestReportData($clean_view_id, array($dimension->dimension_name,'date'), $metrics);
				if(count($ga_object) > 0) {

					foreach($ga_object as $o_key => $value) {
						$ga_to_store[$d_key][$o_key]['dimensions'] = serialize($value->getDimensions());
						$ga_to_store[$d_key][$o_key]['metrics'] = serialize($value->getMetrics());
						$ga_to_store[$d_key][$o_key]['data_date'] = null !== $value->getDate() ? strtotime($value->getDate()) : '';
					}

				}
				unset($ga_object);
			}

			$timestamp = time();

			$sql = "SELECT stored_date FROM account_data WHERE view_id = $clean_view_id";
			$data = DB::query($sql);

			foreach($ga_to_store as $dimensions) {

				foreach($dimensions as $value) {

					$sql = "INSERT INTO account_data (view_id, dimensions, metrics, data_date, stored_date, timestamp) VALUES (
						'".$clean_view_id."', 
						'".$value['dimensions']."',
						'".$value['metrics']."',
						'".$value['data_date']."',
						'".$today."',
						".$timestamp."
					)";
					DB::query($sql);

				}

			}

		}

		private static function get_stored_data($view_id) {

			$clean_view_id = DB::clean($view_id);

			//self::store_data($clean_view_id);

			$sql = "SELECT dimensions, metrics FROM account_data WHERE view_id = $clean_view_id";
			$data = DB::query($sql);

			$output['dates'] = [];
			foreach($data as $key => $value) {

				$dimension = false;
				$date = false;

				$dimensions = unserialize($value['dimensions']);

				if(count($dimensions) == 1) {
					$dimension = key($dimensions);
					$date = $dimensions['date'];
					$dimension_value = false;
				}
				else {
					$date = $dimensions['date'];
					unset($dimensions['date']);
					reset($dimensions);
					$dimension = key($dimensions);
					$dimension_value = $dimensions[$dimension];
					//echo $date.' - '.$dimension_value.'<br />';
				}

				if($dimension_value) {
					$output[$date][$dimension][$dimension_value] = unserialize($value['metrics']);
				}
				else {
					$output[$date][$dimension] = unserialize($value['metrics']);
				}

				$dimension_value = false;
				//$output[$dimension][$date] = unserialize($value['metrics']);
				//ksort($output[$dimension]);
			}

			ksort($output);

			// echo '<pre>';
			// 	print_r($output);
			// echo '</pre>';

			// die;

			return $output;

		}

		public static function get_ga_data() {
			$ga = new gapi(gapi_email, gapi_pass);
			$output = $ga->requestAccountData();

			return $output;
		}

		public static function get_all_account_ids($project_id = false) {

			$sql_addon = '';

			if($project_id) {
				$clean_project_id = DB::clean($project_id);
				$sql_addon = " WHERE project_id = ".$clean_project_id;
			}

			$sql = "SELECT ga_view_id FROM accounts ".$sql_addon." ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = $value['ga_view_id'];
			}

			return $output;

		}

		public static function get_connected_views() {

			$output = [];
			$ga = new gapi(gapi_email, gapi_pass);
			$ga->requestAccountData();

			foreach($ga->getAccounts() as $account) {
				foreach($account->getProfiles() as $key => $profile) {

					$view_id = $profile['id'];

					$output[$view_id]['name'] 		= $account->getName();
					$output[$view_id]['property_name'] = $profile['name'];
					$output[$view_id]['url'] 		= $account->getwebsiteUrl();
					$output[$view_id]['property_id'] = $account->getId();
					$output[$view_id]['view_id'] 	= $account->getProfileId();
				}
			}

			return $output;

		}

		public static function store_data_for_all_connected_views() {
			$views = self::get_connected_views();
			foreach($views as $view) {
				$clean_view_id = DB::clean($view['view_id']);
				self::store_data($clean_view_id);
			}
			die;
		}

		public static function filter_account_data($accounts, $from, $to) {

			$str_from 	= date('Ymd', $from);
			$str_to 	= date('Ymd', $to);

			foreach($accounts as $account) {

				foreach($account->data as $date => $metrics) {
					if($date < $str_from || $date > $str_to) {
						unset($account->data[$date]);
					}
				}

			}

			return $accounts;
		}

		public static function get_total_by_day($accounts) {

			$total = [];

			foreach($accounts as $account) {
				foreach($account->data as $date => $dimensions) {
					foreach($dimensions as $dimension => $metrics) {
						foreach($metrics as $metric => $value) {
							if(!isset($total[$date][$dimension][$metric])) {
								$total[$date][$dimension][$metric] = 0;
							}
							if(!is_array($value)) {
								$total[$date][$dimension][$metric] += $value;
							}
 						}
					}
				}
			}

			ksort($total);

			// echo '<pre>';
			//  	print_r($total);
			// echo '</pre>';
			
			// die;

			return $total;
		}

		public static function get_total_summary($accounts) {

			$summary = [];

			// function cmp_users($a, $b) {
			// 	return $b['users'] - $a['users'];
			// }

			foreach($accounts as $account_key => $account) {

				foreach($account->data as $date => $dimensions) {
					foreach($dimensions as $dimension => $metrics) {
						foreach($metrics as $metric => $value) {

							if(!is_array($value)) {
								// totalt
								if(!isset($summary[$dimension]['summary'][$metric])) {
									$summary[$dimension]['summary'][$metric] = 0;
								}
								// per bolag
								if(!isset($summary[$dimension][$account_key]['summary'][$metric])) {
									$summary[$dimension][$account_key]['summary'][$metric] = 0;
								}
								if($dimension == 'date') {
									// totalt
									$summary[$dimension]['summary'][$metric] += $value;
									// per bolag
									$summary[$dimension][$account_key]['summary'][$metric] += $value;
								}
							}
							else {
								// totalt
								if(!isset($summary[$dimension]['variations'][$metric])) {
									$summary[$dimension]['variations'][$metric] = [];
								}
								// per bolag
								if(!isset($summary[$dimension][$account_key]['variations'][$metric])) {
									$summary[$dimension][$account_key]['variations'][$metric] = [];
								}
								foreach($value as $key => $val2) {
									// totalt
									if(!isset($summary[$dimension]['summary'][$key])) {
										$summary[$dimension]['summary'][$key] = 0;
									}
									// per bolag
									if(!isset($summary[$dimension][$account_key]['summary'][$key])) {
										$summary[$dimension][$account_key]['summary'][$key] = 0;
									}
									// totalt
									if(!isset($summary[$dimension]['variations'][$metric][$key])) {
										$summary[$dimension]['variations'][$metric][$key] = 0;
									}
									// per bolag
									if(!isset($summary[$dimension][$account_key]['variations'][$metric][$key])) {
										$summary[$dimension][$account_key]['variations'][$metric][$key] = 0;
									}
									// totalt
									$summary[$dimension]['summary'][$key] += $val2;
									$summary[$dimension]['variations'][$metric][$key] += $val2;
									// per bolag
									$summary[$dimension][$account_key]['summary'][$key] += $val2;
									$summary[$dimension][$account_key]['variations'][$metric][$key] += $val2;
								}
							}
							// if(isset($summary[$dimension]['variations'][$metric]) && is_array($summary[$dimension]['variations'][$metric])) {
							// 	usort($summary[$dimension]['variations'], "cmp_users");
							// }
 						}
					}
				}
			}

			// echo '<pre>';
			// 	print_r($summary);
			// echo '</pre>';

			// die;

			return $summary;
		}

		public static function get_total_data_in_reports($accounts, $report_from, $report_to) {

			$reports = [];
			$week = 0;

			foreach($accounts as $account) {
				foreach($account->data as $date => $dimensions) {

					$day_no = date('w', strtotime($date));
					$demo_w = date('W', strtotime($date));

					if($week == 0) {
						$week = date('W', strtotime($date));	
					}
					elseif($day_no == $report_from && $report_from <= 4 && $report_from != 0) {
						$week = date('W', strtotime($date));
					}
					elseif(($day_no == $report_from && $report_from > 4) || ($day_no == $report_from && $report_from == 0)) {
						if($report_from == 0) { $report_from = 7; }
						$next_monday = strtotime($date)+(60*60*24*(8-$report_from));
						$week = date('W', $next_monday);
					}

					foreach($dimensions as $dimension => $metrics) {
						foreach($metrics as $metric => $value) {
							if(!isset($reports[$week][$dimension][$metric])) {
								$reports[$week][$dimension][$metric] = 0;
							}
							$reports[$week][$dimension][$metric] += $value;
 						}
					}
				}
			}

			ksort($reports);

			return $reports;
		}

		public static function get_data_in_reports($accounts, $report_from, $report_to) {

			$reports = [];

			foreach($accounts as $key => $account) {
				$week = 0;
				foreach($account->data as $date => $dimensions) {

					$day_no = date('w', strtotime($date));
					$demo_w = date('W', strtotime($date));

					if($week == 0) {
						$week = date('W', strtotime($date));	
					}
					elseif($day_no == $report_from && $report_from <= 4 && $report_from != 0) {
						$week = date('W', strtotime($date));
					}
					elseif(($day_no == $report_from && $report_from > 4) || ($day_no == $report_from && $report_from == 0)) {
						if($report_from == 0) { $report_from = 7; }
						$next_monday = strtotime($date)+(60*60*24*(8-$report_from));
						$week = date('W', $next_monday);
					}

					foreach($dimensions as $dimension => $metrics) {
						foreach($metrics as $metric => $value) {
							if(!isset($reports[$key][$week][$dimension][$metric])) {
								$reports[$key][$week][$dimension][$metric] = 0;
							}
							if(!is_array($value)) { 
								$reports[$key][$week][$dimension][$metric] += $value;
							}
 						}
					}
				}
			}

			foreach($reports as $report) {
				ksort($reports);
			}

			// echo '<pre>';
			//  	print_r($reports);
			// echo '</pre>';
			
			// die;

			return $reports;
		}

		public static function get_report_weeks($accounts, $report_from, $report_to) {

			$weeks = [];
			$week = 0;

			$account_id = min(array_keys($accounts));
			foreach($accounts[$account_id]->data as $date => $dimensions) {

				$day_no = date('w', strtotime($date));
				$demo_w = date('W', strtotime($date));

				if($week == 0) {
					$week = date('W', strtotime($date));	
				}
				elseif($day_no == $report_from && $report_from <= 4 && $report_from != 0) {
					$week = date('W', strtotime($date));
				}
				elseif(($day_no == $report_from && $report_from > 4) || ($day_no == $report_from && $report_from == 0)) {
					if($report_from == 0) { $report_from = 7; }
					$next_monday = strtotime($date)+(60*60*24*(8-$report_from));
					$week = date('W', $next_monday);
				}

				$weeks[$week] = $week;
			}

			return $weeks;
		}

		public static function json_changestatus($input) {

			$clean_input = DB::clean($input);
			$output = [];

			$sql = "SELECT online FROM accounts WHERE id = ".$clean_input['id'];
			$data = DB::query($sql, true);

			$status = $data['online'] == 0 ? 1 : 0;

			$sql = "UPDATE accounts SET online = ".$status." WHERE id = ".$clean_input['id'];
			$done = DB::query($sql);

			if($done) {
				$output['status'] = $status;
			}

			echo json_encode($output); die;

		}

		public static function json_store_data_for_all_connected_views() {

			$views = self::get_connected_views();
			$count = 0;

			foreach($views as $view) {
				$clean_view_id = DB::clean($view['view_id']);
				self::store_data($clean_view_id);
				$count++;
			}

			$output['status'] = $count == count($views) ? 1 : 0;

			echo json_encode($output); die;

		}

	}