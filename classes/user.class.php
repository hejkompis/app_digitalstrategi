<?php

	class User {

		public $id, $name, $company, $email, $admin;

		function __construct($id) {

			$clean_id = DB::clean($id);

			$sql = "SELECT id, name, client_id, email, admin, online FROM users WHERE id = ".$clean_id;
			$data = DB::query($sql, true);

			$user_has_access = self::user_has_access($data['id']);
			$this->id 		= $data['id'];
			$this->name 	= $data['name'];
			$this->email 	= $data['email'];
			$this->admin 	= $data['admin'];
			$this->online 	= $data['online'];
			$this->client 	= new Client($data['client_id']);
			$this->user_has_access = $user_has_access;

		}

		// Logga in om du inte är inloggad
		public static function login($input = false) {
			$clean_input = DB::clean($input);

			$output = [
				'no_login_check' => true,
				'title' => 'Logga in',
				'data'	=> $clean_input
			];
			return $output;
		}

		// Beställ återställning av lösenord
		public static function getpassword($input = false) {
			$clean_input = DB::clean($input);

			$output = [
				'no_login_check' => true,
				'title' => 'Glömt lösenord',
				'data'	=> $clean_input
			];
			return $output;
		}

		// Beställ återställning av lösenord
		public static function setpassword($input = false) {
			$clean_input = DB::clean($input);

			$output = [
				'no_login_check' => true,
				'title' => 'Återställ lösenord',
				'data'	=> $clean_input
			];
			return $output;
		}

		public static function showlist() {
			$output = [
				'title' => 'Användare',
				'users'	=> User::get_all()
				];
			return $output;
		}

		public static function add($input = false) {
			$output = [
				'title' => 'Skapa ny användare',
				'clients' => Client::get_all()
			];
			return $output;
		}

		public static function edit($input = false) {

			$clean_input 	= DB::clean($input);
			$user 			= isset($clean_input['id']) ? new User($clean_input['id']) : User::is_logged_in();
			$clients = Client::get_all();
			
			$output = [
				'title' 			=> 'Redigera användare',
				'user' 				=> $user,
				'clients' 			=> $clients,
			];
			return $output;
		}

		private static function user_has_access($user_id) {

			$clean_user_id = DB::clean($user_id);

			$sql = "SELECT client_id FROM user_has_access WHERE user_id = $clean_user_id";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $client_id) {
				$output[] = $client_id['client_id'];
			}

			return $output;
		}

		public static function is_logged_in() {

			if(!isset($_SESSION["digitalstrategi"])) {

				//$twig_data['http_referer'] = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null;

				//header('Location: /user/login?redirect_url=');
				header('Location: /user/login');
				die();

			} 
			
			else {

				$user = new User($_SESSION['digitalstrategi']['user_id']);

			}

			return $user;
		
		}

		//Kollar om en användare får logga in och skapar en instans vid lyckad inloggning
		public static function dologin($input){

			$cleanInput = DB::clean($input);
			$scrambledPassword = hash_hmac("sha1", $cleanInput["password"], "Au dessus de le kebab");

			$sql = "SELECT id, admin, online
					FROM users
					WHERE email = '".$cleanInput["email"]."'
					AND password = '".$scrambledPassword."'
					";
			//TRUE gör att man bara får tillbaka en rad
			$data = DB::query($sql, TRUE); 

			$output = [];

			if($data){
				if($data['online'] == 1) {
					$_SESSION['digitalstrategi']['user_id'] = $data['id'];
					if($data['admin'] == 1) {
						$output['redirect_url'] = '/';
					}
					else {
						$output['redirect_url'] = '/project/showlist/';
					}
				}
				else {
					$output['redirect_url'] = '/user/login/?error=inactivated';
				}
			}
			else {
				$output['redirect_url'] = '/user/login/?error=notfound';
			}

			return $output;

		}

		public static function get($user_id) {

			$clean_id = DB::clean($user_id);

			$sql = "SELECT id FROM users WHERE id = ".$clean_id;
			$data = DB::query($sql, true);

			return new User($data['id']);

		}

		public static function get_all() {

			$sql = "SELECT id FROM users ORDER BY name";
			$data = DB::query($sql);

			$output = [];
			foreach($data as $user) {
				$output[] = new User($user['id']);
			}

			return $output;

		}		

		public static function save($input) {
			
			$clean_input = DB::clean($input);
			if(!isset($clean_input['admin'])) {
				$clean_input['admin'] = 0;
			}

			$scrambledPassword = hash_hmac("sha1", $clean_input["password"], "Au dessus de le kebab");

			$sql = "INSERT INTO users (name, client_id, email, password, admin) VALUES (
				'".$clean_input['name']."',
				'".$clean_input['client_id']."', 
				'".$clean_input['email']."', 
				'".$scrambledPassword."', 
				".$clean_input['admin']."
			)";
			$id = DB::query($sql);

			foreach($clean_input['user_has_access'] as $client_id) {
				$sql = "INSERT INTO user_has_access (user_id, client_id) VALUES (
					".$id.", 
					".$client_id."
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
			if(!isset($clean_input['admin'])) {
				$clean_input['admin'] = 0;
			}

			$sql = "
			UPDATE users SET 
			name = '".$clean_input['name']."',
			client_id = '".$clean_input['client_id']."',
			email = '".$clean_input['email']."',
			admin = ".$clean_input['admin']."
			WHERE id = ".$clean_input['id'];

			DB::query($sql);

			if($clean_input['password'] != '') {
				$scrambledPassword = hash_hmac("sha1", $clean_input["password"], "Au dessus de le kebab");
				$sql = "
				UPDATE users SET 
				password = '".$scrambledPassword."'
				WHERE id = ".$clean_input['id'];

				DB::query($sql);
			}

			$sql = "DELETE FROM user_has_access WHERE user_id = ".$clean_input['id']."";
			DB::query($sql);

			foreach($clean_input['user_has_access'] as $client_id) {
				$sql = "INSERT INTO user_has_access (user_id, client_id) VALUES (
					".$clean_input['id'].", 
					".$client_id."
				)";
				DB::query($sql);
			}

			$output = [
			'redirect_url' => $clean_input['redirect_url']
			];

			return $output;

		}

		public static function changepassword($input) {

			$clean_input = DB::clean($input);

			$sql = "SELECT * FROM recovery WHERE user_id = ".$clean_input['user_id']." AND hash = '".$clean_input['hash']."' LIMIT 1";
			$data = DB::query($sql, true);

			if(!$data) {
				$output['redirect_url'] = '/user/setpassword/?error=notfound';
			}
			elseif($data['used'] == 1) {
				$output['redirect_url'] = '/user/setpassword/?error=used';
			}
			elseif($data['timestamp'] < time()) {
				$output['redirect_url'] = '/user/setpassword/?error=old';
			}
			else {
				$scrambledPassword = hash_hmac("sha1", $clean_input["password"], "Au dessus de le kebab");
				$sql = "
				UPDATE users SET 
				password = '".$scrambledPassword."'
				WHERE id = ".$clean_input['user_id'];

				DB::query($sql);

				$sql = "
				UPDATE recovery SET 
				used = 1
				WHERE id = ".$data['id'];

				DB::query($sql);

				$output = ['redirect_url' => '/'];
			}

			return $output;

		}

		public static function delete($input) {

			$clean_id = DB::clean($input['id']);

			$sql = "DELETE FROM users WHERE id = ".$clean_id;
			DB::query($sql);

			$output = ['redirect_url' => $input['http_referer']];
			return $output;

		}

		public static function json_changestatus($input) {

			$clean_input = DB::clean($input);
			$output = [];

			$sql = "SELECT online FROM users WHERE id = ".$clean_input['id'];
			$data = DB::query($sql, true);

			$status = $data['online'] == 0 ? 1 : 0;

			$sql = "UPDATE users SET online = ".$status." WHERE id = ".$clean_input['id'];
			$done = DB::query($sql);

			if($done) {
				$output['status'] = $status;
			}

			echo json_encode($output); die;

		}

		//Loggar ut användaren.
	 	public static function logout() {

	 		//$_SESSION['everythingSthlm']['userId'] = FALSE;
	 		session_destroy();

	 		$output = ['redirect_url' => '//'.ROOT];
	 		return $output;
	 	}

	 	public static function sendpasswordlink($input) {
	 		$clean_input = DB::clean($input);
	 		$ip = DB::get_user_ip();

	 		$sql = "SELECT id, email FROM users WHERE email = '".$clean_input['email']."' AND online = 1 ORDER BY id LIMIT 1";
	 		$data = DB::query($sql, true);

	 		if($data) {

	 			$address = 'digiplay.dev';

	 			$user_id = $data['id'];
	 			$user_email = $data['email'];
	 			$hash = DB::generate_string(25,4);
	 			$timestamp = time();
	 			$bestbefore = $timestamp + (24*60*60);
	 			// måste ändras skarpt
				$recoveryaddress = 'http://'.$address.'/user/setpassword/?id='.$user_id.'&code='.$hash;
	 			
	 			$sql = "INSERT INTO recovery (
	 				user_id, 
	 				timestamp, 
	 				hash, 
	 				used, 
	 				ip
	 			) VALUES (
	 				".$user_id.",
	 				".$bestbefore.",
	 				'".$hash."',
	 				0,
	 				'".$ip."'
	 			)";
	 			DB::query($sql);

	 			$subject = 'Återställning av lösenord';
		
				$message = '
				
					<html>
						
						<head>
						
							<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
						
							<style>
						
								body {
									background-color: #252830;
									width:100%;
									font-family: arial !important;
									font-size: 14px;
									color: #cfd2da;
								}
								
								div {
									width:100%;
									padding:5% 10%;
									box-sizing: border-box;					
								}
								
								a {
									text-decoration:none;
									color: #fff !important;
								}
								
								a#verify_link {
									font-size: 14px;
									text-transform: none;
									letter-spacing: normal;
									color: #fff;
									background-color: #1CA8DD;
									border-color: #1997c6
									display: inline-block;
									margin-bottom: 0;
									font-weight: 400;
									vertical-align: middle;
									cursor: pointer;
									border: 1px solid transparent;
									white-space: nowrap;
									padding: 6px 12px;
									line-height: 1.5;
									border-radius: 4px;
									-webkit-user-select: none;
									-moz-user-select: none;
									-ms-user-select: none;
									user-select: none
								}
								
								a#verify_link:hover {
									background-color: #137499;
									border-color: #137499;
									color:#fff;
									text-align: center;
								}
								
								h1 {
									font-size:24px;
									font-weight:600;
								}
								
								span {
									text-decoration: underline;
								}
						
							</style>
						
							<title></title>
							
						</head>
						
						<body>
						
							<div>
											
								<h1>Återställning av lösenord</h1>
								
								<p>Klicka på knappen nedan för att återställa ditt lösenord. Den automatiskt genererade koden är giltig t.o.m. '.date('Y-m-d H:i', $bestbefore).'.</p>
												
								<a id="verify_link" href="'.$recoveryaddress.'" target="_blank">Återställ lösenord</a>
												
								<p>Fungerar inte knappen kan du klistra in länken <span>'.$recoveryaddress.'</span> i din webbläsare.</p>
															
							</div>
										
						</body>
						
					</html>
						
				';
							
				$headers = "MIME-Version: 1.0" . "\r\n";
				$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
				$headers .= 'From: no-reply(a)'.$address.'<no-reply@'.$address.'>' . "\r\n";
				$headers .=	'Reply-To: no-reply(a)'.$address.'<no-reply@'.$address.'>' . "\r\n";
				$headers .=	'X-Mailer: PHP/' . phpversion();
		
				// Skicka
				mail($user_email, '=?UTF-8?B?'.base64_encode($subject).'?=', $message, $headers);
				$output['redirect_url'] = '/';
	 	
	 		}
	 		else {
	 			$output['redirect_url'] = '/user/getpassword/?error=notfound';
	 			$output['error'] = 'E-postadressen finns inte i vårt system';
	 		}

	 		return $output;

	 	}

	}