// ###########################################################################
// library of necessary functions
// ##############################################################################

	// random integers
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * Math.floor(max - min)) + min;
	}
	
	// how often is element in array
	function wieOft(arr, suchWert) {
		var anz=0;
		for (var i=0; i<arr.length; i++)
			if (arr[i]==suchWert) anz++;
		return anz;
	}
	
	// replace colon by komma
	function komma(zahl) {
		var nkomma = zahl - Math.trunc(zahl);
		//if (nkomma<0.00001) zahl = Math.round(zahl*10)/10; // 1 Nachkommastelle
		if (nkomma<0.00001) zahl = Math.round(zahl*100)/100; // 2 Nachkommastellen
		if (nkomma==0) zahl = Math.round(zahl); // 0 Nachkommastellen
		return zahl.toString().replace('.',',');
	}
	
	function str(zahl,stellen) {
		if (stellen == undefined) stellen=0;
		return komma(zahl.toFixed(stellen));
	}
	
	// general function to replace placeholders in task string
	function prepText(variable, unit) {
		var z, not;
		not = aufg[nr]['not_'+variable];
		do {
			z = getRandomInt(aufg[nr]['min_'+variable],aufg[nr]['max_'+variable]);
		} while (z==not);
		multiplier = aufg[nr]['multiplier_'+variable];
		if (multiplier==undefined) multiplier = 1;
		z = Math.round(z*multiplier*100)/100;
		
		var regExp = new RegExp('{'+variable+'}','g');
		if (unit=='%')
			task = task.replace(regExp, komma(Math.round(z*100)) + '%');
		else
			task = task.replace(regExp, komma(z) + (unit==undefined ? '' : unit));
		return z;
	}

	function nextWordNo() {
		var cookie = cookiePrefix+'MatchedWords';
		var matchedWords = sessionStorage.getItem(cookie);
		if (matchedWords=='' || !matchedWords) {
			var matchedWords = [];
			var partArr = aufg[0]['textVariants']['matchedWords'];
			var len = Object.keys(partArr).length;
			for (var i=0; i<len; i++)
				matchedWords.push(i);
		} else {
			matchedWords = matchedWords.split(',')
		}
		no = getRandomInt(0,matchedWords.length);
		no = matchedWords[no]
		matchedWords.splice(matchedWords.indexOf(no),1);
		sessionStorage.setItem(cookie,matchedWords);	
		return no;
	}
	
	function prepareRandomText() {
		
		// random Words
		var partArr = aufg[0]['textVariants']['rndWords'];
		for (part in partArr) {
			partObj = partArr[part];
			var no = getRandomInt(0,partObj.length);
			replaceStr(part,partObj[no]);
		}
		
		// matched Words
		var no = nextWordNo();
		var partArr = aufg[0]['textVariants']['matchedWords'];
		for (part in partArr) {
			replaceStr(part,partArr[part][no]);
		}		
	}

	
	function initVar(variable) {
		var z, not;
		not = aufg[nr]['not_'+variable];
		do {
			z = getRandomInt(aufg[nr]['min_'+variable],aufg[nr]['max_'+variable]);
		} while (z==not);
		multiplier = aufg[nr]['multiplier_'+variable];
		if (multiplier==undefined) multiplier = 1;
		z = Math.round(z*multiplier*100)/100
		return z;
	}
	
	function initCoef(variable) {
		var v = initVar(variable);
		var sign = (Math.sign(v)==-1) ? '-' : '+';
		var strV = (Math.abs(v)==1) ? '' : String(Math.abs(v));
		return [v, sign, strV];
	}
	
	function replaceStr(placeholder,variable) {
		var regExp = new RegExp('{'+placeholder+'}');
		task = task.replace(regExp, variable);
	}
	
	function prepareInterpretation(placeholder,variable) {
		var regExp = new RegExp('{'+placeholder+'}');
		interpretation = interpretation.replace(regExp, variable);
	}
	
	function paraStr(para) {
		var ret;
		switch (para) {
			case 'mu':
				ret = tstart+'\\hat{\\mu}'+tend;
				break;
			case 'p':
				ret = tstart+'\\hat{p}'+tend;
				break;
			default:
				ret = para;
		}
		return ret;
	}
	
	// funtions and variables for button events

	function getLastTextFieldNo() {
		var aArr = aufg[nr]['answerFlds'];
		aCount = Object.keys(aArr).length;
		for (a=0; a<aCount; a++) {
			var aInputType = aufg[nr]['answerFlds'][a]['inputType'];
			if (aInputType == 'text') lastTextFieldNo = a;
		}
	}	
	
	function prepareBtns() {
		
		if (detailType == 'all') {
			btnTxtMore = '&nbsp;Mehr Details&nbsp;';
			btnTxtLess = '&nbsp;Weniger Details&nbsp;';
			maxDetailLevel = 1;
		}
		if (detailType == 'step') {
			btnTxtMore = '&nbsp;Schritt&nbsp;';
			btnTxtLess = '&nbsp;von vorne&nbsp;';
			maxDetailLevel = len;
		}
	}
	
	// functions for button events
	function neue() {
		localStorage.setItem('TW_Seite',location.href);	
		if (allCorrect && moodle)
			window.location.href = 'https://elearning.dhbw-stuttgart.de/moodle/mod/resource/view.php?id='+moodleId;
		else
			location.reload();
		//main();
	}
	
	var showOnReturn = function solutionOnReturnKey(event) {
		if (event.keyCode === 13) zeigen(typ);
	}
	
	var showNew = function newTaskOnReturnKey(event) {
		if (event.keyCode === 13) neue();
	}
	
	function changeDetailsBtn() {
		// buttons
		buttonArea = document.getElementById('buttonArea');
		var buttonHTML = '';
		
		// draw refresh button
		buttonHTML = 	'<button type="button" id="reloadBtn" tabindex="101" style="background: blue; background-color: blue; color: white; border-radius: 25px; padding: 6px; box-shadow: none; outline: none; border: 0; font-size: large;">&nbsp;Neue Aufgabe&nbsp;</button>';

		// draw detail button
		detailLevel = parseInt(sessionStorage.getItem('TW_detailLevel'));
		if (detailLevel == undefined) detailLevel=0;
		if (detailType=='step') var lvl=detailLevel+1+'&nbsp;'; else var lvl='';
		var detStr = (detailLevel>=maxDetailLevel) ? btnTxtLess : btnTxtMore+lvl;
		if (detailType != undefined) {
			buttonHTML += ' &nbsp; '+'<button type="button" id="detailBtn" style="background: blue; background-color: blue; color: white; border-radius: 25px; padding: 6px; box-shadow: none; outline: none; border: 0; font-size: large;">&nbsp;'+detStr+'&nbsp;</button>';
		}
		// display
		buttonArea.innerHTML = buttonHTML;		
	}
	
	function zeigen(typ) {
		// change color of solution
		let element = document.getElementById('resultate');
		element.style.color = 'black';

		prepareBtns();
		changeDetailsBtn();	
		
		// prepary event listeners
		var reloadBtn = document.getElementById('reloadBtn');
		reloadBtn.addEventListener('click', neue, false);
		reloadBtn.addEventListener('keyup', function(event) {
			  if (event.keyCode === 13) { neue; }
			}, false);
		if (detailType != undefined) {
			var detailBtn = document.getElementById('detailBtn');
			detailBtn.addEventListener('click', function() {
				if (detailLevel>=(maxDetailLevel)) detailLevel=0; else detailLevel++;
				sessionStorage.setItem('TW_detailLevel',detailLevel);
				if (detailType=='step') var lvl=detailLevel+1+'&nbsp;'; else var lvl='';
				var detStr = (detailLevel>=maxDetailLevel) ? btnTxtLess : btnTxtMore+lvl;
				document.getElementById('detailBtn').innerHTML=detStr;
				solve(typ);
			}, false);
		}
		// event listener for return key on last textfield
		getLastTextFieldNo();
		if (lastTextFieldNo == (aCount-1)) {
			var lstTxtFld = document.getElementById('solution'+lastTextFieldNo);
			lstTxtFld.removeEventListener('keyup', showOnReturn, false);
			lstTxtFld.addEventListener('keyup', showNew, false);
//			lstTxtFld.addEventListener('keyup', function(event) {
//				  if (event.keyCode === 13) { neue(); }
//				}, false);
		}
		
		//stop stop watch
		timeEnd = Date.now();
		duration = (timeEnd - timeStart)
		timeNeeded = '&#8986;'+(duration/1000).toFixed(1); //&#8986;
		
		// solve
		solve(typ);
		
	}

function ausgabe() {

	var aArr = aufg[nr]['answerFlds'];
	var aCount = Object.keys(aArr).length;
	for (a=0; a<aCount; a++) {	
		var formel = document.getElementById('solution'+a).value
		formel = formel.replace(/\^0.5/, '^{0.5}');
		document.getElementById('render'+a).innerHTML = '\\('+formel+'\\)';
	}
	MathJax.texReset();	
	MathJax.typesetPromise(); 
}
	
	function prepareAnswerForm() {
		var a, aArr, aCount, aWidth, aNr, aLabel, aInputType, aSize, aRows, aCols;
		var answerStr = '';
		aArr = aufg[nr]['answerFlds'];
		aCount = Object.keys(aArr).length;
		
		for (a=0; a<aCount; a++) {

			aWidth = aufg[nr]['answerWidth'];
			aLabel = aufg[nr]['answerFlds'][a]['label'];
			aInputType = aufg[nr]['answerFlds'][a]['inputType'];
			
			if (a==0) autofocus='autofocus'; else autofocus='';
			var oninput = render ?  ' oninput="ausgabe()"' : '';

			switch (aInputType) {
				case 'text':
					aSize = aufg[nr]['answerFlds'][a]['size'];
					
					answerStr += '<label for "solution'+a+'" style="min-width: '+aWidth+'em; display: inline-block;">'+aLabel+'</label>';
					answerStr += '<input type="text" id="solution'+a+'" size="'+aSize+'" tabindex="'+(a+1)+'" value="" '+autofocus+oninput+'> <button type="button" id="helpBtn'+a+'" tabindex="110">&#9432;</button>\n';
					if (render) answerStr += '<br><span id="render'+a+'" style="padding:5px 0px 0px '+(aWidth*19)+'px;"></span>';
					break;
					
				case 'textarea':
					aRows = aufg[nr]['answerFlds'][a]['rows'];
					aCols = aufg[nr]['answerFlds'][a]['cols'];
					
					answerStr += '<label for "solution'+a+'" style="min-width: '+aWidth+'em; display: inline-block; vertical-align: top;">'+aLabel+'</label>';			
					answerStr += '<textarea id="solution'+a+'" rows="'+aRows+'"  cols="'+aCols+'" wrap="soft" tabindex="'+(a+1)+'" style="font-size: x-large"></textarea> <button type="button" id="helpBtn'+a+'" tabindex="110" style="vertical-align: top;">&#9432;</button>\n';
					break;
					
				case 'radio':
					answerStr += aLabel+':<br>';
					
					var options = aufg[nr]['answerFlds'][a]['options'];
					for (var i=0; i<options.length; i++) {
						answerStr += '<input type="radio" name="'+aLabel+'" id="sol'+aLabel+'id'+i+'" value="'+options[i]+'" >';
						answerStr += '<label for "sol'+aLabel+'id'+i+'" >'+options[i]+'</label><br>';
						}
					break;
			}
			answerStr += '<p><span id="helpText'+a+'" style="font-size: small"></span></p>';
		}
		
		// Variablen ersetzen
		if (vars!=undefined) {
			for (var i=0; i<vars.length; i++) {
				var regExp = new RegExp('{var'+(i+1)+'}','g');
				answerStr = answerStr.replace(regExp, vars[i]);
			}
		}
		
		// Ausgabe
		document.getElementById('antworten').innerHTML = answerStr; 
		
		// prepare EventListeners for input help and rendering
		for (a=0; a<aCount; a++) {
			// rendering
			var helpBtn = document.getElementById('helpBtn'+a);
			helpBtn.addEventListener('click', function() {
					var id=this.getAttribute('id').slice(-1);
					var helpText = aufg[nr]['answerFlds'][id]['help'];
					if (helpText==undefined) helpText = 'helpFormulas';
					showHelp(id, helpText);
				
			}, false);
			
			// render
			//if (render) document.getElementById('render'+a).oninput = ausgabe();
				
		}
	}
	

	
// ----------------------------
// Statistical Distributions
// ----------------------------

function parabola(x) {
	return (x-5)**2 
}
function NVpdf(x, mu, sigma) {
	return 1/(sigma*Math.sqrt(2*Math.PI))*Math.exp(-((x-mu)**2)/(2*sigma**2))
}
function NVcdf(x, mu, sigma) {
	return 1/(1 + Math.exp(-0.07056*((x-mu)/sigma)**3 - 1.5976*(x-mu)/sigma))
}

function NVinv(p, mu, sigma) {
  function erfcinv(p) {
    var j = 0;
    var x, err, t, pp;
    if (p >= 2)
      return -100;
    if (p <= 0)
      return 100;
    pp = (p < 1) ? p : 2 - p;
    t = Math.sqrt(-2 * Math.log(pp / 2));
    x = -0.70711 * ((2.30753 + t * 0.27061) /
      (1 + t * (0.99229 + t * 0.04481)) - t);
    for (; j < 2; j++) {
      err = erfc(x) - pp;
      x += err / (1.12837916709551257 * Math.exp(-x * x) - x * err);
    }
    return (p < 1) ? x : -x;
  }

  function erfc(x) {
    return 1 - erf(x);
  }

  function erf(x) {
    var cof = [-1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2,
      -9.561514786808631e-3, -9.46595344482036e-4, 3.66839497852761e-4,
      4.2523324806907e-5, -2.0278578112534e-5, -1.624290004647e-6,
      1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
      6.529054439e-9, 5.059343495e-9, -9.91364156e-10,
      -2.27365122e-10, 9.6467911e-11, 2.394038e-12,
      -6.886027e-12, 8.94487e-13, 3.13092e-13,
      -1.12708e-13, 3.81e-16, 7.106e-15,
      -1.523e-15, -9.4e-17, 1.21e-16,
      -2.8e-17
    ];
    var j = cof.length - 1;
    var isneg = false;
    var d = 0;
    var dd = 0;
    var t, ty, tmp, res;

    if (x < 0) {
      x = -x;
      isneg = true;
    }

    t = 2 / (2 + x);
    ty = 4 * t - 2;

    for (; j > 0; j--) {
      tmp = d;
      d = ty * d - dd + cof[j];
      dd = tmp;
    }

    res = t * Math.exp(-x * x + 0.5 * (cof[0] + ty * d) - dd);
    return isneg ? res - 1 : 1 - res;
  }

  return -1.41421356237309505 * sigma * erfcinv(2 * p) + mu;
}


function gammaln(x) {
  var j = 0;
  var cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
  ];
  var ser = 1.000000000190015;
  var xx, y, tmp;
  tmp = (y = xx = x) + 5.5;
  tmp -= (xx + 0.5) * Math.log(tmp);
  for (; j < 6; j++)
    ser += cof[j] / ++y;
  return Math.log(2.5066282746310005 * ser / xx) - tmp;
};



function ibeta(x, a, b) {
  // Factors in front of the continued fraction.
  var bt = (x === 0 || x === 1) ?  0 :
    Math.exp(gammaln(a + b) - gammaln(a) -
             gammaln(b) + a * Math.log(x) + b *
             Math.log(1 - x));
  if (x < 0 || x > 1)
    return false;
  if (x < (a + 1) / (a + b + 2))
    // Use continued fraction directly.
    return bt * betacf(x, a, b) / a;
  // else use continued fraction after making the symmetry transformation.
  return 1 - bt * betacf(1 - x, b, a) / b;
};


function betacf(x, a, b) {
  var fpmin = 1e-30;
  var m = 1;
  var qab = a + b;
  var qap = a + 1;
  var qam = a - 1;
  var c = 1;
  var d = 1 - qab * x / qap;
  var m2, aa, del, h;

  // These q's will be used in factors that occur in the coefficients
  if (Math.abs(d) < fpmin)
    d = fpmin;
  d = 1 / d;
  h = d;

  for (; m <= 100; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    // One step (the even one) of the recurrence
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin)
      d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin)
      c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    // Next step of the recurrence (the odd one)
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin)
      d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin)
      c = fpmin;
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < 3e-7)
      break;
  }

  return h;
};


function ibetainv(p, a, b) {
  var EPS = 1e-8;
  var a1 = a - 1;
  var b1 = b - 1;
  var j = 0;
  var lna, lnb, pp, t, u, err, x, al, h, w, afac;
  if (p <= 0)
    return 0;
  if (p >= 1)
    return 1;
  if (a >= 1 && b >= 1) {
    pp = (p < 0.5) ? p : 1 - p;
    t = Math.sqrt(-2 * Math.log(pp));
    x = (2.30753 + t * 0.27061) / (1 + t* (0.99229 + t * 0.04481)) - t;
    if (p < 0.5)
      x = -x;
    al = (x * x - 3) / 6;
    h = 2 / (1 / (2 * a - 1)  + 1 / (2 * b - 1));
    w = (x * Math.sqrt(al + h) / h) - (1 / (2 * b - 1) - 1 / (2 * a - 1)) *
        (al + 5 / 6 - 2 / (3 * h));
    x = a / (a + b * Math.exp(2 * w));
  } else {
    lna = Math.log(a / (a + b));
    lnb = Math.log(b / (a + b));
    t = Math.exp(a * lna) / a;
    u = Math.exp(b * lnb) / b;
    w = t + u;
    if (p < t / w)
      x = Math.pow(a * w * p, 1 / a);
    else
      x = 1 - Math.pow(b * w * (1 - p), 1 / b);
  }
  afac = -gammaln(a) - gammaln(b) + gammaln(a + b);
  for(; j < 10; j++) {
    if (x === 0 || x === 1)
      return x;
    err = ibeta(x, a, b) - p;
    t = Math.exp(a1 * Math.log(x) + b1 * Math.log(1 - x) + afac);
    u = err / t;
    x -= (t = u / (1 - 0.5 * Math.min(1, u * (a1 / x - b1 / (1 - x)))));
    if (x <= 0)
      x = 0.5 * (x + t);
    if (x >= 1)
      x = 0.5 * (x + t + 1);
    if (Math.abs(t) < EPS * x && j > 0)
      break;
  }
  return x;
};


function gamma(n) {
	return (n-1+5.5)**(n-1+0.5)*Math.exp(-(n-1+5.5))* (Math.sqrt(2*Math.PI)*(1.000000000190015+76.18009172947146/(n-1+1)-86.50532032941677/(n-1+2)+24.01409824083091/(n-1+3)-1.231739572450155/(n-1+4)+.001208650973866179/(n-1+5)-0.000005395239384953/(n-1+6)))
}

function Tpdf(x, nu) {
	return gamma((nu+1)/2.) /(Math.sqrt(nu*Math.PI) *gamma(nu/2.)) *((1+(x*x)/nu)**(-(nu+1)/2.))
}

function Tinv(p, dof) {
    var x = ibetainv(2 * Math.min(p, 1 - p), 0.5 * dof, 0.5);
    x = Math.sqrt(dof * (1 - x) / x);
    return (p > 0.5) ? x : -x;
  }
	
// ===========================================================================
// hier trennen sich die functionsBefore und die functionsAfter
// ===========================================================================

	// grading
	
	function sortTerms(fStr,vars) {
		// this sorts a function string according to variables
		arr = tidyFunctionString(fStr) 	// clean up unnecessary chars first...
		var sorted = '';
		// x_1 in front
		for (var j=0; j<vars.length; j++) {
			for (var i=0; i<arr.length; i++)
				if (arr[i].indexOf(vars[j])>-1) sorted += arr[i];
		}
		// then just numbers
		for (var i=0; i<arr.length; i++) {
			var regEx = /[a-z]/g;
			if (!regEx.test(arr[i])) sorted += arr[i];
		}
		// remove a potential + at the first position
		if (sorted.slice(0,1)=='+') sorted = sorted.slice(1,sorted.length);
		return sorted;
	}
	
	function tidyFunctionString(fStr) {
		// returns array of terms of a function, unsorted
		fStr = '+'+fStr;
		fStr = fStr.replace(/\+/g,' +'); // Leerzeichen vor Rechenzeichen rein
		fStr = fStr.replace(/-/g,' -'); // Leerzeichen vor Rechenzeichen rein
		fStr = fStr.replace(/\*/g,''); // * entfernen
		fStr = fStr.replace(/\((.*)\)/g,'$1'); // () entfernen
		fStr = fStr.replace(/\+\s*-/g,'-'); // +-
		fStr = fStr.replace(/([0-9]+)(\s)+([a-z]+)/g,'$1$3');  // Leerzeichen zwischen Zahl und Variable entfernen
		fStr = fStr.replace(/([-\+])\s/g,'$1');  // Rechenzeichen ranrücken
		return fStr.split(/[\s]+/g);
	}
	
	function sortTermsIntoArray(fStr,vars) {
		// returns array of terms of a function, in sorted order
		arr = tidyFunctionString(fStr)
		var sorted = [''];  // place for just the number
		// x_1 in front, x_2 next, ...
		for (var j=0; j<vars.length; j++) {
			sorted.push(''); // extend array for each variable
			for (var i=0; i<arr.length; i++)
				if (arr[i].indexOf(vars[j])>-1) sorted[j] += arr[i];
		}
		// then just numbers
		for (var i=0; i<arr.length; i++)
			if (!(/[a-z]/g).test(arr[i])) sorted[2] += arr[i];
		// remove a potential + at the first position
		if (sorted[0]!=undefined)
			if (sorted[0].slice(0,1)=='+') sorted[0] = sorted[0].slice(1,sorted[0].length);
		// remove a potential + at last position (only if no input from user)
		if (sorted[2]=='+') sorted[2]='';
		return sorted;
	}                                              
	
	function getSolutions() {
		var maxSolutions = Object.keys(aufg[nr]['answerFlds']).length;		
		for (var i=0; i<maxSolutions; i++)
			solutions.push(document.getElementById('solution'+i).value);
	}
	
	function grade() {
		
		var note = document.getElementById('note');	
		var checkMark = document.getElementById('checkMark');
		var loesungen=[], rechenZeichen = [], radioLoesungen = [];
		var regEx;
		
		// Anzahl Eingabefelder
		var maxSolutions = Object.keys(aufg[nr]['answerFlds']).length;
		console.log('maxSolutions',maxSolutions);
		console.log('solutions',solutions);
		
		// texts and number solutions
		if (checkSign) regEx = /[[\s]+\+-]/; else regEx = /[\s]+/;
		for (var i=0; i<maxSolutions; i++) {
			// solutions.push(document.getElementById('solution'+i).value);
			if (solutions[i] != '') {
				if (aufg[nr]['answerFlds'][i]['inputType']=='textarea') {
					splitted = solutions[i].split(regEx);
					for (var u=0; u<splitted.length; u++){
						if (splitted[u].search(',')==-1) {
							loesungen.push(splitted[u].toLowerCase());  // kein Komma
						}
						else
							loesungen.push(parseFloat(splitted[u].replace(',','.')).toFixed(2).replace('.',',').toLowerCase());
					}
				} else {
					loesungen.push(solutions[i]);
				}
			} else {
				loesungen.push('9999');
			}
		} 
		//if (loesungen[0]=='') loesungen.shift();
		console.log('solutions',solutions);
		console.log('loesungen',loesungen);
		console.log('results',results);
		
		// calculation sign solutions
		if (checkSign) {
			//solutions = [];
			regEx = /[a-z\^0-9]+/;
			for (var i=0; i<maxSolutions; i++) {
				//solutions.push(document.getElementById('solution'+i).value);
				if (solutions[i] != '') {
					splitted = solutions[i].split(regEx);
					for (var u=0; u<splitted.length; u++){
							rechenZeichen.push(splitted[u])
					}
				} else {
					loesungen[i] = 9999;
				}
			}
			rechenZeichen.pop() // leeres Element am Ende entfernen
		}
		console.log('nach checksign');
		/*
		// radio buttons
		for (var a=0; a<1; a++) {
			for (var i=0; i<2; i++) {
				var radioId='sol'+'Pizza'+'id'+i;
				console.log('radioId',radioId);
				var el = document.getElementById(radioId);
				if (el.checked) radioLoesungen.push(el.value);
			}
		}
		console.log('radioLoesungen',radioLoesungen);
		*/
		
		// check on correctness
		allCorrect = true;
		var btnFeedback = '';
		var feedback = '';
	
		// choose default color strings
		for (var i=0; i<results.length; i++) {
			colors.push('red'); 
			colorsSign.push('red');
		}
		
		// numerical solutions
		console.log('loesungen.length',loesungen.length);
		for (var i=0; i<loesungen.length; i++) {
			console.log('results[i] ist',results[i]);
			if (results[i]!=undefined) {
				if (Array.isArray(results[i])) {	
					console.log('ist array');
					if (!results[i].includes(loesungen[i])) {
						allCorrect = false;
					} else {
						colors[i]='green';
					}
				} else {
					console.log('KEIN array');
					if (String(results[i]) != loesungen[i]) {
						allCorrect = false;
					} else {
						colors[i]='green';
					}
				}
			}
		}
		
		// calcultion sign solutions
		for (var i=0; i<rechenZeichen.length; i++) {
			if (resultsSign[i]!=undefined) {
				if (resultsSign[i] != rechenZeichen[i]) {
					allCorrect = false;
				} else {
					colorsSign[i]='green';
				}
			}
		}
			
		// print result
		if (allCorrect == true) {
			checkMark.innerHTML = icOK;
			checkMark.style.color = 'green';
			feedback = ' Sehr gut! 3 Punkte erzielt!'
			score += 3;
			correctN[nr] += 1;
			if (duration<topTime) {
				feedback += ' Und neue Bestzeit!';
				topTime=duration;
			}
			note.innerHTML = feedback;
			//console.log('solvedN,timeN[nr],duration',solvedN[nr],timeN[nr],duration);
			var avgTime = (timeN[nr]==99999) ? duration/correctN[nr] : (correctN[nr]*timeN[nr]+duration)/(correctN[nr]+1)
			// update list of tasks
			console.log('tasks',tasks);
			console.log('nr',nr);
			console.log('indexOf(nr)',tasks.indexOf(String(nr)));
			tasks.splice(tasks.indexOf(nr.toString()),1);
			console.log('tasks',tasks);
		} else {
			checkMark.innerHTML = icNotOK;
			checkMark.style.color = 'red';
			note.innerHTML = ' Leider ist nicht alles richtig. ';
			score += 1;
			var avgTime = timeN[nr];
			// update list of tasks
			if (wieOft(tasks,nr)<3) tasks.push(nr.toString());
		}
		solvedN[nr] = parseInt(solvedN[nr])+1;
		document.getElementById('timeNeeded').innerHTML = '('+timeNeeded+'s)';
		
		// ----------------------------------------
		// store Coockies and print score & topTime
		// ----------------------------------------
		sessionStorage.setItem(cookiePrefix+'CurrentLevel',currentLevel);
		sessionStorage.setItem(cookiePrefix+'Tasks',tasks);	
		localStorage.setItem(cookiePrefix+'Score',score);
		localStorage.setItem(cookiePrefix+'TopTimeN'+nr,topTime);
		localStorage.setItem(cookiePrefix+'N'+nr,solvedN[nr]);
		localStorage.setItem(cookiePrefix+'CorrectN'+nr,correctN[nr]);
		localStorage.setItem(cookiePrefix+'TimeN'+nr,avgTime);
		document.getElementById('score').innerHTML = score;
		document.getElementById('avgTime').innerHTML = (avgTime/1000).toFixed(1);
		document.getElementById('correct').innerHTML = ((correctN[nr]/solvedN[nr])*100).toFixed(0)+'%';
		
	}
	


	// --------------------------
	//     Help Texts
	// --------------------------
	
	var helpTexts = [
		{
		helpFormulas: `
		Hochstellen schreibst Du mit einem kleinen Dach, also z.B.
		A^T für \\( \\mathbf{A^T} \\).<br>
		Gib Deine Lösung bitte ohne Malzeichen ein, also z.B.
		A^TD für \\( \\mathbf{A^T \\cdot D} \\).
		`,
		matrix: `
		Einzelne Matrixelemente werden durch <i>Leerzeichen</i> getrennt,<br>
		<i>Zeilen</i> durch [Return] bzw. [Enter].`,
		xmatrix: `
		Einzelne Matrixelemente werden durch <i>Leerzeichen</i> getrennt,<br>
		<i>Zeilen</i> durch [Return] bzw. [Enter].<br>
		Tiefstellen schreibst Du mit Unterstrich, z.B. <i>x_1</i>.<br>
		Griechische Buchstaben schreibst Du aus, z.B. <i>lambda</i>.`,
		jaNein: 'Entweder <i>ja</i> oder <i>nein</i> eingeben.',
		solvable: 'Entweder <i>lösbar</i> oder <i>nicht lösbar</i> eingeben.',
		singular: 'Entweder <i>singulär</i> oder <i>regulär</i> eingeben.',
		definit: `
		Möglich sind <i>positiv definit</i>, <i>negativ definit</i> oder
		<i>indefinit</i>.`,
		extremum: `
		Möglich sind <i>Mnimum</i>, <i>Maximum</i> oder
		<i>Sattelpunkt</i>.`,
		dimensions: `
		Gib' erst die inhaltlichen Dimensionen an, dann die Zeilen und Spalten,
		z.B. RxV(2x2)`,
		derivative: `
		Tiefstellen schreibst Du mit einem Unterstrich, also z.B.
		x_1 für \\( x_1 \\).<br>
		Hochstellen schreibst Du mit einem kleinen Dach, also z.B.
		x^2 für \\( x^2 \\)`,
		}
	];
	
	function showHelp(a, helpText) {
		document.getElementById('helpText'+a).innerHTML = helpTexts[0][helpText];
		MathJax.typesetPromise()
	}
	

	
	// +++++++++++++++++++++++
	//          main
	// +++++++++++++++++++++++

	// --------------------------
	//     Main HTML skeleton
	// --------------------------
	var mainHTML = `
<!--   +++ Scores +++  -->

<p style="float: right">
&#x1F3C6; <span id="score"></span> &nbsp; 
<b style="color: green">&check;</b> <span id="correct" style="color: green"></span> &nbsp; 
&#8986; <span id="avgTime"></span>s &nbsp; <a href="Dashboard.htm">&#128203;</a></p>
<p>&nbsp;</p>

<!--   +++ Überschrift +++  -->
<h1 id="titel" style="color: red; font-family: Arial"></h1>
<span id="platform"></span>

<!--   +++ Aufgabe +++  -->

<b>Aufgabe:</b><br>
<span id="aufgabe"></span>
<br>

<!--   +++ Funktion +++  -->
<span id="divAbove" style="width:500px;height:400px;"></span>
<span id="functionAbove"></span>

<!--   +++ Antworten +++  -->
<b>Antwort:</b><br>
<p>
<form id="solution_form" method="post" autocomplete="off" onsubmit="return false;">
	<p><span id="antworten"></span></p>
</form>
<span id='buttonArea'></span>
</p>

<!--   +++ Ergebnisse +++  -->				
<span id="resultate" style="color: white">
 <br> <p><b>Lösung:</b> &nbsp; <span id="timeNeeded"></span></p>
<p><b><span id="checkMark" style="color: red"></b></span>
<span id="note"></span><p>
<p><span id="result"></span></p>

<!--   +++ Grafik +++  -->
<span id="myDiv" style="width:500px;height:500px;"></span><br>
<span id="function"></span>
</span>

<!--   +++ Funktion +++  -->
<span id="divBelow" style="width:500px;height:500px;"></span><br>
<span id="functionBelow"></span>
</span>
	`;
	
	var results = [], resultsSign = [],
		solutions = [], 
		colors = [], colorsSign = [],
		checkMarks = [], 
		btnResult, x, z,
		buttonArea, lastTextFieldNo, 
		reloadBtn,
		el,
		nr,
		detailLevel, maxDetailLevel, btnTxtMore, btnTxtLess;
	var vars;
	var alt;
	var score, duration, topTime;
	var allCorrect;
	var maxLevel = 0, level, currentLevel, easierLevels = [];
	
	// Vars for performance control
	var solvedN = [], correctN = [], timeN = [], topTime = [];
	
	// Vars for statistical tasks
	var unit, mu, sigma, delta, conf, para, w, nu;
	
	function main() {
		
		// print main HTML skeleton
		document.getElementById('mainHTML').innerHTML = mainHTML;
		
		// Cookies & Local Storage for Array of tasks
		tasks = sessionStorage.getItem(cookiePrefix+'Tasks');
		currentLevel = sessionStorage.getItem(cookiePrefix+'CurrentLevel');
		
		// prepare list of tasks if empty
		console.log('tasks',tasks);
		if (!tasks) {
			// calculate maxLevel
			for (var i=0; i<aufg.length; i++) {		
				level = aufg[i].level;
				if (level==undefined) level = 1;
				if (aufg[i]['level'] > maxLevel) maxLevel = level;
			}
			tasks = [];
			// fill list with Ids of tasks, but order by 
			// level of difficulty
			if (!currentLevel) currentLevel = 0;
			while (tasks.length==0) {
				currentLevel++;
				if (currentLevel>maxLevel) currentLevel = 1;
				for (var i=0; i<aufg.length; i++) {
					level = aufg[i].level;
					if (level==undefined) level = 1;
					if (level==currentLevel) tasks.push(String(i));  
				}
			}
			//console.log('currentLevel:',currentLevel,'tasks',tasks);
			sessionStorage.setItem(cookiePrefix+'CurrentLevel',currentLevel);	
			sessionStorage.setItem(cookiePrefix+'Tasks',tasks);		
		} else {
			tasks = tasks.split(',');
		}
		// list of easier tasks (to make repetitions less boring)
		if (currentLevel>1) {
			for (var i=0; i<aufg.length; i++) {
				level = aufg[i].level;
				if (level==undefined) level = 1;
				if (level<currentLevel) easierLevels.push(i);
			}
		} else {
			for (var i=0; i<aufg.length; i++) {
				level = aufg[i].level;
				if (level==undefined) level = 1;
				if (level==1) easierLevels.push(i);	
			}
		}
		console.log('currentLevel:',currentLevel,'easierLevels',easierLevels);

		// choose an exercise randomly
		console.log('tasks',tasks);
		i = getRandomInt(0,tasks.length);
		nr = parseInt(tasks[i]);
		console.log('nr aktuelle Aufgabe',nr);

		// +++++++++ nur für Test ++++++++++
		if (teste != undefined) nr = teste;
		// +++++++++++++++++++++++++++++++++
		
		
		// ----------------------------
		//  Cookies & Local Storage
		// ----------------------------
		// score
		score = localStorage.getItem(cookiePrefix+'Score');
		if (score == null) score = 0; else score = parseInt(score);
		document.getElementById('score').innerHTML = score;	
		// time
		topTime = localStorage.getItem(cookiePrefix+'TopTimeN'+nr);
		if (topTime == null) topTime = 99999; else topTime = parseInt(topTime);
		
		// check session storage to avoid that a task appears twice after each other
		var oldTask = parseInt(sessionStorage.getItem('confTaskNo'));
		if (oldTask==nr) {
			var setOfTasks = new Set(tasks);
			if (tasks.length==1 || setOfTasks.size==1) {
				// get easier level task to fill in
				i = getRandomInt(0,easierLevels.length);
				console.log('i',i);
				nr = parseInt(easierLevels[i]);
				console.log('nr',nr);
			} 
			else {
				// take another one of same level first
				while (oldTask==nr) {
				//if (nr==aufg.length-1) nr = 0; else nr += 1;
					i = getRandomInt(0,tasks.length);
					console.log('i',i);
					nr = parseInt(tasks[i]);				
				}
			}
		}		
		sessionStorage.setItem('confTaskNo',nr);

		// +++++++++ nur für Test ++++++++++
		if (teste != undefined) nr = teste;
		// +++++++++++++++++++++++++++++++++		
		
		// preparations for solution with steps
		if (detailType=='steps') {
			var aArr = aufg[nr]['steps'];
			len = Object.keys(aArr).length;
		}

		// detail level of solution
		prepareBtns();
		detailLevel = parseInt(sessionStorage.getItem('TW_detailLevel'));
		if (isNaN(detailLevel)) detailLevel=0;	
		sessionStorage.setItem('TW_detailLevel',detailLevel);
		
		// number of exercises already solved
		for (var i=0; i<aufg.length; i++) {
			// solved
			var solved = localStorage.getItem(cookiePrefix+'N'+i);
			if (solved == null) solvedN.push(0); else solvedN.push(parseInt(solved));
			// correctly solved
			var correct = localStorage.getItem(cookiePrefix+'CorrectN'+i);
			if (correct == null) correctN.push(0); else correctN.push(parseInt(correct));
			// avg time
			var avgTime = localStorage.getItem(cookiePrefix+'TimeN'+i);
			if (avgTime == null) timeN.push(99999); else timeN.push(parseInt(avgTime));			
		}
		document.getElementById('correct').innerHTML = (solvedN[nr]!= 0) ? ((correctN[nr]/solvedN[nr])*100).toFixed(0)+'%' : '0%';
		document.getElementById('avgTime').innerHTML = (timeN[nr]/1000).toFixed(1);
			
		// save list of topics for dashboard
		var topics = [];
		for (var t=0; t<aufg.length; t++) 
			topics.push(aufg[t].topic);
		localStorage.setItem(cookiePrefix+'Topics',topics);
		
		// get variables from auf array
		console.log('nr',nr);
		task = aufg[nr]['text'];
		interpretation = aufg[nr]['interpretation'];
		vars = aufg[nr]['vars']; // get variable names, if available
		
		// prepare variables for random task formulation
		typ = aufg[nr].typ; // typen.next();
		
		// dynamic html output
		printTask();
		prepareAnswerForm();
	
		// draw correct button
		buttonArea = document.getElementById('buttonArea');
		buttonArea.innerHTML = 	'<button type="button" id="submitBtn" tabindex="100" style="background-color: blue; color: white; border-radius: 25px; padding: 6px; border:0; font-size: large">&nbsp;Prüfen&nbsp;</button>';
		
		// ========================
		// prepare event listeners
		// ========================
		var submitBtn = document.getElementById('submitBtn'); // button click
		submitBtn.addEventListener('click', function() {zeigen(typ)}, false);
		submitBtn.addEventListener('keyup', function(event) {
			  if (event.keyCode === 13) { zeigen(typ); }
			}, false);		
		// return key on last textfield triggers check button
		getLastTextFieldNo();	
		if (lastTextFieldNo == (aCount-1)) {
			var lstTxtFld = document.getElementById('solution'+lastTextFieldNo);
			lstTxtFld.addEventListener('keyup', showOnReturn, false);
		}
		
		// set stop watch
		timeStart = Date.now();

	}
	
	main();