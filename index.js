function parseInfo(str) {
  var reg = /([+-]?\d+)?([a-zA-Z]+)?(?:\^(\d+))?/;
  return ("+" + str)
    .replace(/\s/g, '') //remove space
    .replace(/([+-](?=[a-zA-Z]))/g, match => match + '1') // replace +-x => +-1x
    .replace(/[a-zA-Z]+\^0/g, '') // replace ax^0 => a
    .replace(/\-/g, '+-') // replace -x => +-x
    .split('+')
    .reduce(function(accum, value) {
      if (!value) return accum;

      var m = value.match(reg);
      var coefficient = parseFloat(m[1]);
      var variable = m[2];
      var exponent = parseFloat((variable && (m[3] || 1)) || 0);

      var info = accum[exponent] = accum[exponent] || {};
      info.exponent = exponent;
      info.variable = variable;
      info.coefficient = (info.coefficient || 0) + coefficient;

      return accum;
    }, []);
}

function parse(equation) {

  var [leftSide, rightSide] = equation.split('=');

  return parseInfo(rightSide)
    .reduce(function(accum, value, exponent) {
      if (value) {
        var info = accum[exponent];
        value.coefficient *= -1;

        if (info) {
          info.coefficient = (info.coefficient || 0) + value.coefficient;
        }
        else {
          accum[exponent] = value;
        }

      }
      return accum;
    }, parseInfo(leftSide));
}

function signToCoefficient(coefficient) {
  var sign = coefficient > 0 ? '+' : '';
  return sign + coefficient;
}

function simplify(handledEquation) {
  var leftSide = handledEquation
    .filter(value => value && value.coefficient !== 0)
    .reverse()
    .map(function(value) {
      var tail = value.variable ?
          value.variable + "^" + value.exponent : "";
      return signToCoefficient(value.coefficient) + tail;
    })
    .join("")
    .replace(/^\+/, '')
    .replace(/1([a-zA-Z]+)/g, (match, p) => p);

  return leftSide + '=0';
}

function stepMessage(n, message) {
  return 'Step ' + n + ' : ' + message;
}

function isInt(n) {
  return n === parseInt(n, 10);
}

function prettySqrt(n) {
  var value = Math.sqrt(n);
  if (isInt(value)) return value;
  return 'sqrt(' + n + ')';
}

function prettyDivide(a, b) {
  var value = a / b;
  if (isInt(value)) return value;
  return '(' + a + '/' + b + ')';
}

function prettyAdd(a, b) {
  var value = a + b;
  if (+value === value) return value;
  return '(' + a + '+' + b + ')';
}

function prettySub(a, b) {
  var value = a - b;
  if (+value === value) return value;
  return '(' + a + '-' + b + ')';
}

function printSolution(solution) {
  if (typeof solution === 'string') return solution;
  if (solution.length === 1) return 'x=' + solution[0];
  else return 'x1=' + solution[0] + ', x2=' + solution[1];
}

function solve(equation) {
  var step = 0;
  var handledEq = parse(equation);
  var simple = simplify(handledEq);

  if (simple !== equation.replace(/\s/g, '')) {
    console.log(stepMessage(++step, 'convert to ax^2+bx+c=0'));
    console.log(simple);
  }

  var solution;
  var [zero, one, two] = handledEq;

  switch (true) {
    case !!(two && two.coefficient):
      console.log(stepMessage(++step, 'a#0'));
      var a = two.coefficient;
      var b = one.coefficient;
      var c = zero.coefficient;
      var delta = b*b - 4*a*c;

      console.log('Delta: ' + delta);

      if (delta > 0) {
        console.log('Delta>0 => x1=(-b+sqrt(delta))/2a, x2=(-b-sqrt(delta))/2a')
        solution = [
          prettyDivide(prettyAdd(-b, prettySqrt(delta)), 2 * a),
          prettyDivide(prettySub(-b, prettySqrt(delta)), 2 * a)
          ];
      }
      else if (delta === 0) {
        console.log('Delta=0 => x=-b/2a')
        solution = [prettyDivide(-b, (2 * a))];
      }
      else {
        console.log('Delta<0 => x1=(-b+i*sqrt(-delta))/2a, x2=(-b-i*sqrt(-delta))/2a')
        solution = [
          prettyDivide(prettyAdd(-b, 'i*' + prettySqrt(-delta)), 2 * a),
          prettyDivide(prettySub(-b, 'i*' + prettySqrt(-delta)), 2 * a)
          ];
      }
      break;

    case !!(one && one.coefficient):
      console.log(stepMessage(++step, 'a=0 and b#0 => x=-c/b'));
      solution = -(zero && zero.coefficient || 0) / one.coefficient;
      break;

    case !zero || zero.coefficient === 0:
      console.log(stepMessage(++step, 'a=0 and b=0 and c=0 => Infinite Number of Variables'));
      solution = "Infinite Number of Variables";
      break;

    default:
      console.log(stepMessage(++step, 'a=0 and b = 0 and c#0 => No solutions'))
      solution = "No solutions";
  }

  console.log("Solution: " + printSolution(solution));
}

solve("x^2 +2x + 1 = 0");
