<?php

	class Statistics {

		private $key, $project, $track, $start, $end, $no_of_users = 0, $users = [];

		private function __construct(
			$write_key = 'd41e18ba271540df8ec9', 
			$read_key = 'd81ff4f975c0416c9b00', 
			$project = '20026', 
			$track = '144123', 
			$start = '1/3/2015', 
			$end = '12/12/2016'
		) {

			$project_array = [
			'key' 		=> $write_key,
			'project' 	=> $project,
			'track'		=> $track,
			'start' 	=> '03/01/2015',
			'end'		=> date('m/d/Y')
			];

			//self::updateProjectUsers($project_array);
			//self::getProjectUsers($project_array);

			$this->write_key 	= $write_key;
			$this->read_key 	= $read_key;
			$this->project 		= $project;
			$this->track 		= $track;
			$this->start 		= $start;
			$this->end 	 		= $end;

			

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

		static private function getData($url) {

			$ch = curl_init();

			curl_setopt($ch, CURLOPT_URL, $url); 
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

			$output = curl_exec($ch); 
			$output = json_decode($output);
			return $output;

			curl_close($ch);

		}

		static private function updateProjectUsers($input_array) {

			$clean_array = DB::clean($input_array);

			// hämta projektsummering
			$url = 'http://api.hapyak.com/api/reports/quiz/project/summary?key='.$clean_array['key'].'&project='.$clean_array['project'].'&track='.$clean_array['track'].'&start='.$clean_array['start'].'&end='.$clean_array['end'];
			$project = self::getData($url);

			echo '<pre>';
				echo count($project->data);
			echo '</pre>';

			// hämta alla nuvarande användare från Hapyak
			$url = 'http://api.hapyak.com/api/reports/gradebook/summary?key='.$clean_array['key'].'&project='.$clean_array['project'].'&track='.$clean_array['track'].'&start='.$clean_array['start'].'&end='.$clean_array['end'];
			$users = self::getData($url);

			// hämta nuvarande användare som är sparade till samma projekt
			$sql = "SELECT user_id FROM users WHERE project = ".$clean_array['project']." AND track = ".$clean_array['track']." ORDER BY id";
			$user_array = DB::query($sql);

			$current_users = [];
			$new_users = [];

			foreach($user_array as $user_values) {
				$current_users[] = $user_values['user_id'];
			}

			// kolla av om användare med motsvarande id redan finns i databasen
			foreach($users->users as $user) {
				if(!in_array($user->user_id, $current_users)) {
					$new_users[] = $user->user_id;
				}
			}

			// lägg till nya användare i databasen
			foreach($new_users as $new_user) {

				$sql = "
				INSERT INTO users 
				(user_id, project, track, date_added)
				VALUES
				('".$new_user."', ".$clean_array['project'].", ".$clean_array['track'].", ".time().")
				";

//				DB::query($sql);

			}

		}

		static private function getProjectUsers($input_array) {

			$clean_array = DB::clean($input_array);

			// hämta nuvarande användare som är sparade till samma projekt
			$sql = "SELECT * FROM users WHERE test != 1 AND project = ".$clean_array['project']." AND track = ".$clean_array['track']." ORDER BY id";
			$user_array = DB::query($sql);

			$users = [];

			foreach($user_array as $user_values) {

				$url = 'http://api.hapyak.com//api/reports/gradebook/users/answers?gradebook_user='.$user_values['user_id'].'&key='.$clean_array['key'].'&project='.$clean_array['project'].'&track='.$clean_array['track'].'&start='.$clean_array['start'].'&end='.$clean_array['end'];
				$user_data = self::getData($url);

				echo '<pre>';
				print_r($user_data);
				echo '</pre>';

			}

		}

		public static function testurl() {

			$s = new Statistics();

			$url = 'http://api.hapyak.com/api/reports/quiz/project/summary?key='.$s->write_key.'&project='.$s->project.'&track='.$s->track.'&start='.$s->start.'&end='.$s->end;
			$output = self::getData($url);
			
			echo '<pre>Result:<br /><br />'; print_r($output); echo '</pre>';

			die();

		}

	}