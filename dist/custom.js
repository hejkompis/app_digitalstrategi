/* custom.jquery.js */

// Tillbakaknapp

$(document).ready(function() {

	$('.btn-back').click(function(e) {
		e.preventDefault();
		goBack();
	})

});

function goBack() {
    window.history.back();
}

// Bekräftelsefunktion för knapp

$(document).ready(function() {

	$(document).on('click', '[data-type="confirm"]', function() {
		var msg = $(this).data('message');
		if(!confirm(msg)) return false;
	});

});

$(document).ready(function() {

	var gotReq = false;

	if($('.req').length == 0) { $('form [type=submit]').removeAttr('disabled'); }
	else { 
		$('.req').each(function() {
			checkForm($(this));
			var thisName = $(this).attr('name');
			thisName = thisName.split('[')
			$('label[for='+thisName[0]+']').append('<span>*</span>');
			gotReq = true;
		});
	}
	
	// visar req-rutan
	if(gotReq) { $('#req_info').removeClass('hidden'); }
	
	// om det finns ett formulär ska första rutan alltid vara iklickad
	if($('form').length > 0 && $('form input:text').first().val() == '') { $('form input:text').first().focus(); }
	
	// kollar så att allt är ok när req ändrats
	$(document).on('keyup', '.req', function() {
		
		checkForm($(this));
		
	});
	
	$(document).on('blur', '.req', function() {
				
		checkForm($(this)); // 
		
	});
	
	// om det finns "password_repeat" ska den överensstämma med "password"
	if($("#password_repeat").length) {

		$('#password_repeat').ready(function() {
			
			$(document).on('keyup', '#password, #password_repeat', function() {
				
				var passValOne = $('#password').val();
				var passValTwo = $('#password_repeat').val();
				
				if(passValOne !== passValTwo) {
					
					$('#password_repeat').parent('div').addClass('has-error');
					$('[type=submit]').attr('disabled', 'disabled');
									
				}
				
				else {
					
					$('#password_repeat').parent('div').removeClass('has-error');
					$('[type=submit]').removeAttr('disabled');
					$('.req').each(function() {
						checkForm($(this));
					});
									
				}
				
			});
			
		});

	}

	$(document).on('click', '[data-type="json-changestatus"]', function(e) {

		e.preventDefault();

		editBtn = $(this);
		editBtn.html('<i class="fa fa-spinner fa-spin fa-fw"></i>');

		var url = editBtn.attr('data-href');
		var jqxhr = $.getJSON(url, function(e) {
			console.log(e.status);
			if(e.status === 1) {
				editBtn.html('<i class="fa fa-check-square-o fa-fw"></i>');
			}
			else {
				editBtn.html('<i class="fa fa-square-o fa-fw"></i>');
			}
			
		})
  		.fail(function(e) {
			console.log(e);
		});

	});

	$(document).on('click', '[data-type="toggle-input"]', function(e) {
		var inputID = $(this).data('target');
		if ($('input#'+inputID).attr('disabled')) {
			$('input#'+inputID).removeAttr('disabled');
		} else {
			$('input#'+inputID).attr('disabled', 'disabled');
		}
	});

	$("table").tablesorter({sortList: [[0,0]]});

	$('.get-modal').on('click', function(e) {

		e.preventDefault();

		var title = $(this).data('modal-title');
		var page = $(this).data('modal-body');

		$('#modal-title').html(title);

		$('#modal-body').load('/modal_content/'+page+'.html', function(e) {
			$('#modal').modal('show');
			$('#modal').find('form').parsley();
		});		

	});

	$('#modal').on('hidden.bs.modal', function (e) {
  		
  		$('#modal-title').html('');
  		$('#modal-body').html('');

	});

	$('#modal-save').on('click', function() {
		
		var modal_form_data = {};
		$.each($('#modal-form').serializeArray(), function(i, field) {
			modal_form_data[field.name] = field.value;
		});

		add_contact(modal_form_data);

		$('#modal').modal('hide');
	});

	$('form').parsley();

	$('.graph-tabs a').click(function (e) {
		e.preventDefault();
	});

	$(function() {
		$('#color-picker').colorpicker({
			format: 'rgb'
		});
	});

});

function add_contact(data) {
	
	$('#contact-table tbody .no-tr').remove();
	$('#contact-table tbody').append('<tr><td>'+data.name+'</td><td>'+data.role+'</td><td>'+data.email+'</td><td>'+data.phone+'</td></td>');

}