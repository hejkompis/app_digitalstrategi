<?php

	class Account {

		private $id, $ga_uid, $ga_account_id, $ga_view_id;

		public function __construct($account_id) {

			$clean_account_id = DB::clean($account_id);

			$sql = "SELECT * FROM accounts WHERE id = ".$clean_account_id;
			$data = DB::query($sql, true);

			$this->id 				= $data['id'];
			$this->ga_uid 			= $data['ga_property_id'];
			$this->ga_account_id 	= $data['ga_account_id'];
			$this->ga_view_id 		= $data['ga_view_id'];

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

		public static function save($input) {

			$clean_input = DB::clean($input);

			$sql = "INSERT INTO accounts (ga_uid, ga_account_id, startdate, enddate, project_id) VALUES (
				'".$clean_input['ga_uid']."', 
				'".$clean_input['ga_account_id']."',
				".$clean_input['project_id']."
			)";
			$id = DB::query($sql);

		}

		public static function delete($input) {

			$clean_id = DB::clean($input);
			
			// radera projekt
			$sql = "DELETE FROM accounts WHERE project_id = ".$clean_id;
			DB::query($sql);

		}

		public static function get_all($project_id = false) {

			$sql_addon = '';

			if($project_id) {
				$clean_project_id = DB::clean($project_id);
				$sql_addon = " WHERE project_id = ".$clean_project_id;
			}

			$sql = "SELECT id FROM accounts ".$sql_addon." ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = new Account($value['id']);
			}

			return $output;

		}

		public static function get_all_account_ids($project_id = false) {

			$sql_addon = '';

			if($project_id) {
				$clean_project_id = DB::clean($project_id);
				$sql_addon = " WHERE project_id = ".$clean_project_id;
			}

			$sql = "SELECT ga_account_id FROM accounts ".$sql_addon." ORDER BY id DESC";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $value) {
				$output[] = $value['ga_account_id'];
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

	}