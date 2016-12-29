<?php

	class DB {

		private static $instance = null, $prev_results = [], $mysqli;
		public static $con, $user;

		private function __construct() {

			self::$mysqli = new mysqli(DB_S, DB_U, DB_P, DB_D);
			self::$mysqli->query("SET NAMES 'utf8'");
			self::$con = self::con();
		}

		private static function getInstance() {
			if (self::$instance === null) {
				self::$instance = new DB();
			}
			return self::$instance;
		}

		private static function con() {
			return self::$mysqli;
		}

		// funktion för att tvätta det som skickas från ett formulär med POST, används inte utanför klassen
		public static function clean($input) {

			self::getInstance();

			if(is_array($input)) {
			
				// en array med tvättade värden som matas ut
				$clean_data = [];

				// loopa igenom $_POST
				foreach($input as $key => $value) {

					if(is_array($value)) {

						foreach($value as $subkey => $subvalue) {
							$clean_data[$key][$subkey] = self::$mysqli->real_escape_string($subvalue);
						}

					}

					else {

						$clean_data[$key] = self::$mysqli->real_escape_string($value);

					}
					
				}

			} else {

				if(is_array($input)) {
					foreach($input as $key => $value) {
						$clean_data[$key] = self::$mysqli->real_escape_string($value);
					}
				} else {
					$clean_data = self::$mysqli->real_escape_string($input);
				}
			}

			return $clean_data;
		}


		//Hanterar och returnerar resultat av query
		//Returnerar antingen resultat(TRUE) eller FALSE
		//Skicka med parameter TRUE om bara en rad förväntas tillbaka från databas
		public static function query($query, $single = false) {
			self::getInstance();

			$output = [];
			$hash_query = hash('sha1', $query);

			if(array_key_exists($hash_query, self::$prev_results)) {
				$output = self::$prev_results[$hash_query];
			}
			else {
				if($res = self::$mysqli->query($query)) {
					if($res === TRUE){
						if(self::$mysqli->insert_id != 0){
							$output = self::$mysqli->insert_id;
						}
						else {
							$output = TRUE;	
						}
					}
					else{
						if($single) {
							$data = $res->fetch_assoc();
							$output = $data;
						}
						else {
							$output = [];
							while($data = $res->fetch_assoc()) {
								$output[] = $data;
							}
						}
						self::$prev_results[$hash_query] = $output;
					}
				}

				if(!$res) {
					echo self::$mysqli->error; 
					echo $query;
					die();
				}
			}
			return $output;
		}

		static public function get_json($url) {

			$ch = curl_init();

			curl_setopt($ch, CURLOPT_URL, $url); 
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

			$output = curl_exec($ch); 
			$output = json_decode($output);
			return $output;

			curl_close($ch);

		}

		public static function generate_string($length=9, $strength=0) {
		
		    $vowels = 'aeuy';
		    $consonants = 'bdghjmnpqrstvz';
		    
		    if ($strength & 1) {
		    
		    	$consonants .= 'BDGHJLMNPQRSTVWXZ';
		    
		    }
		    
		    if ($strength & 2) {
		    
		    	$vowels .= "AEUY";
		    
		    }
		    
		    if ($strength & 4) {
		    
		    	$consonants .= '23456789';
		    
		    }
		    
		    if ($strength & 8) {
		    
		    	$consonants .= '@#$%';
		    
		    }
		 
		    $codestring = '';
		    $alt = time() % 2;

		    for ($i = 0; $i < $length; $i++) {

		    	if ($alt == 1) {

		    		$codestring .= $consonants[(rand() % strlen($consonants))];
		    		$alt = 0;

		    	} 
		    	
		    	else {
		    	
		    		$codestring .= $vowels[(rand() % strlen($vowels))];
		    		$alt = 1;
		    	
		    	}
		    
		    }
		
		return $codestring;

		}

		public static function get_user_ip() 
		{
		    $client  = @$_SERVER['HTTP_CLIENT_IP'];
		    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
		    $remote  = $_SERVER['REMOTE_ADDR'];

		    if(filter_var($client, FILTER_VALIDATE_IP))
		    {
		        $ip = $client;
		    }
		    elseif(filter_var($forward, FILTER_VALIDATE_IP))
		    {
		        $ip = $forward;
		    }
		    else
		    {
		        $ip = $remote;
		    }

		    return $ip;
		}

	}

