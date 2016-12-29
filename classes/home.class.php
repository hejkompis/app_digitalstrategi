<?php

	class Home {

		static public function fallback() {

			header('Location: /project/showlist'); die;

		}

		static public function fourOhFour($input = false) {
			$clean_input = DB::clean($input);

			$current_user = User::is_logged_in();

			$output = [
				'title' => '404',
				'data'	=> $clean_input,
				'current_user' => $current_user,
				'page'	=> 'home.fourohfour.twig'
			];
			return $output;
		}

	}