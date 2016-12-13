/**
/* FUNKTIONER
/**/

function checkForm(thisField) {
	
	formOK = true;
	
	gotValue = thisField.val();
	
	if(gotValue.length == 0) {
		
		//thisField.parent('div').removeClass('has-success');
		thisField.parent('div').addClass('has-error');
		$('[type=submit]').attr('disabled', 'disabled');
		
	}
	
	else {
		
		thisField.parent('div').removeClass('has-error');
		//thisField.parent('div').addClass('has-success');
		
	}
		
	$('.req').each(function() {
		
		if($(this).val().length == 0) { formOK = false; }
		
	});
	
	if(formOK) {
		
		$('[type=submit]').removeAttr('disabled');
		
	}
	
}