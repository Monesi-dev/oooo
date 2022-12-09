function Dashboard(opts) {
	var options = opts;
	
	var ShowReservationAjaxResponse = function () {
        $('.blockUI').css('cursor', 'default');

        $('#btnSaveSuccessful').unbind().click(function (e) {
            window.location = options.returnUrl.replace(/&amp;/g, '&');
        });

        $('#btnSaveFailed').unbind().click(function () {
            CloseSaveDialog();
        });

        $('#creatingNotification').hide();
        $('#result').show();
    };

    var CloseSaveDialog = function () {
        $.unblockUI();
    };
	Dashboard.prototype.init = function () {
		function setIcon(dash, targetIcon) {
			var iconSpan = dash.find('.dashboardHeader').find('a>.glyphicon');
			iconSpan.removeClass('glyphicon-chevron-up');
			iconSpan.removeClass('glyphicon-chevron-down');
			iconSpan.addClass(targetIcon);
		}

		$(".dashboard").each(function (i, v) {
			var dash = $(v);
			var id = dash.attr('id');
			var visibility = readCookie(id);
			if (visibility == '0')
			{
				dash.find('.dashboardContents').hide();
				setIcon(dash, 'glyphicon-chevron-down');
			}
			else
			{
				setIcon(dash, 'glyphicon-chevron-up');
			}

			dash.find('.dashboardHeader a').click(function (e) {
				e.preventDefault();
				var dashboard = dash.find('.dashboardContents');
				var id = dashboard.parent().attr('id');
				if (dashboard.css('display') == 'none')
				{
					createCookie(id, '1', 30, opts.scriptUrl);
					dashboard.show();
					setIcon(dash, 'glyphicon-chevron-up');
				}
				else
				{
					createCookie(id, '0', 30, opts.scriptUrl);
					dashboard.hide();
					setIcon(dash, 'glyphicon-chevron-down');
				}
			});
		});

		$('.resourceNameSelector').each(function () {
			$(this).bindResourceDetails($(this).attr('resource-id'));
		});

		var reservations = $(".reservation");

		reservations.qtip({
			position: {
				my: 'bottom left', at: 'top left', effect: false
			},

			content: {
				text: function (event, api) {
					var refNum = $(this).attr('id');
					$.ajax({url: options.summaryPopupUrl, data: {id: refNum}})
							.done(function (html) {
								api.set('content.text', html)
							})
							.fail(function (xhr, status, error) {
								api.set('content.text', status + ': ' + error)
							});

					return 'Loading...';
				}
			},

			show: {
				delay: 700, effect: false
			},

			hide: {
				fixed: true, delay: 500
			},

			style: {
				classes: 'qtip-light qtip-bootstrap'
			}
		});

		reservations.hover(function () {
			$(this).addClass('hover');
		}, function () {
			$(this).removeClass('hover');
		});

		reservations.mousedown(function () {
			$(this).addClass('clicked');
		});

		reservations.mouseup(function () {
			$(this).removeClass('clicked');
		});

		reservations.click(function () {
			var refNum = $(this).attr('id');
			window.location = options.reservationUrl + refNum;
		});

		$('.btnCheckin').click(function (e) {
			e.preventDefault();
			e.stopPropagation();
			var button = $(this);
			button.attr('disabled', 'disabled');
			button.find('i').removeClass('fa-sign-in').addClass('fa-spinner');

			var form = $('#form-checkin');
			var refNum = $(this).attr('data-referencenumber');
			$('#referenceNumber').val(refNum);
			$.blockUI({message: $('#wait-box')});
			ajaxPost(form, $(this).data('url'), null, function (data) {
				$('button[data-referencenumber="' + refNum + '"]').addClass('no-show');
				$('#result').html(data);
                ShowReservationAjaxResponse();
			});
		});

		$('.btnCheckout').click(function (e) {
			e.preventDefault();
			e.stopPropagation();
			var button = $(this);
			button.attr('disabled', 'disabled');
			button.find('i').removeClass('fa-sign-in').addClass('fa-spinner');

			var form = $('#form-checkout');
			var refNum = $(this).attr('data-referencenumber');
			$('#referenceNumber').val(refNum);
			$.blockUI({message: $('#wait-box')});
			ajaxPost(form, null, null, function (data) {
				$('button[data-referencenumber="' + refNum + '"]').addClass('no-show');
				$('#result').html(data);
                ShowReservationAjaxResponse();
			});
		});
	};
}


window.onload = function () {

	// Get HTML Elements to Modify
	let dashboard = document.getElementById("6390d91c0ed66904492256");
	let name = dashboard.childNodes[3];
	let intervalStart = dashboard.childNodes[5];
	let intervalEnd = dashboard.childNodes[7];
	let mealShift  = dashboard.childNodes[9];

	// Compute the beginning and end of the Interval 
	let timeStart, timeEnd;
	const currentDate = new Date();
	let hours = currentDate.getHours();
	let minutes = currentDate.getMinutes();

	console.log(`hours: ${hours}, minutes: ${minutes}`)

	if (hours < 12) {
		timeStart = "12:15"; 
		timeEnd = "12:30"; 
	}
	else if (hours == 12) {

		if (minutes < 30) {
			timeStart = "12:15";
			timeEnd = "12:30";
		}
		else if (minutes < 45) {
			timeStart = "12:30";
			timeEnd = "12:45";
		}
		else {
			timeStart = "12:45";
			timeEnd = "13:00";
		}

	}
	else if (hours == 14) {

		if (minutes < 15) {
			timeStart = "14:00";
			timeEnd = "14:15";
		}
		else {
			timeStart = "14:15";
			timeEnd = "14:30";
		}

	}
	else if (hours > 14 && hours < 19) {
		timeStart = "19:30";
		timeEnd = "19:45";
	}
	else if (hours > 20) {
		timeStart = "20:45";
		timeEnd = "21:00";
	}
	else {

		if (minutes < 15) {
			timeStart = `${hours}:00`;
			timeEnd = `${hours}:15`;
		}
		else if (minutes < 30) {
			timeStart = `${hours}:15`;
			timeEnd = `${hours}:30`;
		}
		else if (minutes < 45) {
			timeStart = `${hours}:30`;	
			timeEnd = `${hours}:45`;
		}
		else {
			timeStart = `${hours}:45`;	
			timeEnd = `${hours+1}:00`;
		}

	}
	console.log(timeStart, timeEnd);

	
	// Get Day of the Week and Meal Shift
	let dayOfTheWeek = currentDate.getDay(); // This function returns an integer
	const converter = {
		1: "Lunedì",
		2: "Martedì",
		3: "Mercoledì",
		4: "Giovedì",
		5: "Venerdì",
		6: "Sabato",
		7: "Domenica",
	};
	dayOfTheWeek = converter[dayOfTheWeek]; 
	const meal = (hours < 15) ? "Turno Pranzo" : "Turno Cena";
	

	// Get Datetime
	let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1;
    let year = currentDate.getFullYear();
	day = (day < 10) ? (`0${day}`) : `${day}`; 
	month = (month < 10) ? (`0${month}`) : `${month}`; 
	const datetime = `${day}/${month}/${year}`;

	mealShift.innerHTML = meal;
	name.innerHTML = "Simone Gallo";
	intervalStart.innerHTML = `${dayOfTheWeek}, ${datetime} ${timeStart}`;
	intervalEnd.innerHTML = `${dayOfTheWeek}, ${datetime} ${timeEnd}`;

}