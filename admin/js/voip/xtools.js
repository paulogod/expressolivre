(function()
{
	var _FILES = [];

	function _convert(pString)
	{
		if ( typeof pString != 'string' )
			return false;

		if ( window.ActiveXObject )
		{
			var _xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
			_xmlDoc.async = "false";
			_xmlDoc.loadXML(pString);
		}
		else
		{
			var parser = new DOMParser();
			var _xmlDoc = parser.parseFromString(pString, "text/xml");
		}

		return _xmlDoc;
	}

	function _load(pFile)
	{
		pFile = this._PATH + 'xsl/' + pFile;
		if ( !(_FILES[pFile]) )
		{
			var _data = null;
			if ( document.implementation.createDocument )
				_data = document.implementation.createDocument("", "", null);
			else
				_data = new ActiveXObject("Msxml2.FreeThreadedDOMDocument");

			_data.async = false;
			_data.load(pFile + '?' + Date.parse(new Date));
			_FILES[pFile] = _data;
		}
		return _FILES[pFile];
	}

	function _parse()
	{
		if ( arguments.length == 1 )
		{
			pXML = _xml('root');
			pXSL = arguments[0];
		}
		else
		{
			pXML = arguments[0];
			pXSL = arguments[1];
		}
		switch ( typeof pXML )
		{
			case 'object' :
			break;
			case 'string' :
				if ( pXML.indexOf('<') == 0 )
					pXML = _convert(pXML);
				else
					pXML = _load.call(this, pXML);
			break;
			default :
				return {'error':'invalid xml'}
		}
		switch ( typeof pXSL )
		{
			case 'object' :
			break;
			case 'string' :
				pXSL = _load.call(this, pXSL);
			break;
			default :
				return {'error':'invalid xsl'}
		}

		var fragment = null;
		if ( window.XSLTProcessor )
		{
			var xslProc = new XSLTProcessor();
			xslProc.importStylesheet(pXSL);

			if ( (arguments.length == 3) && (typeof arguments[2] == 'object') )
			{
				var params = arguments[2];
				for (var i in params )
					 xslProc.setParameter(null, i, params[i]);
			}

			fragment = xslProc.transformToFragment(pXML, document);

			// para retornar valor igual ao ie.
			var aux = document.createElement("div");
			aux.appendChild(fragment);
			fragment = aux.innerHTML;
		}
		else
		{
			var xslTemplate = new ActiveXObject("MSXML2.XSLTemplate");
			xslTemplate.stylesheet = pXSL;

			var xslProc = xslTemplate.createProcessor();
			xslProc.input = pXML;

			if ( (arguments.length == 3) && (typeof arguments[2] == 'object') )
			{
				var params = arguments[2];
				for (var i in params )
					 xslProc.addParameter(i, params[i], '');
			}

			xslProc.transform();
			fragment = xslProc.output;
		}
		return fragment;
	}

	function _xml()
	{
		var a = false;
		if ( document.implementation.createDocument )
			a = document.implementation.createDocument("", "", null);
		else if ( ActiveXObject )
			a = new ActiveXObject("Msxml2.DOMDocument");

		if ( arguments.length == 1 && typeof arguments[0] == 'string' )
			a.appendChild(a.createElement(arguments[0]));
		//with ( a )
		//	appendChild(createProcessingInstruction("xml", "version='1.0'"));

		return a;
	}

	function XTools()
	{
		var _argv = arguments;
		this._PATH = ( _argv.length > 0 ) ?
			_argv[0] : '';
		if ( this._PATH != '' && this._PATH.lastIndexOf('/') != (this._PATH.length - 1) )
			this._PATH += '/';
	}

	XTools.prototype.convert = _convert;
	XTools.prototype.load = _load;
	XTools.prototype.parse = _parse;
	XTools.prototype.xml = _xml;
	window.ADMXTools = XTools;
}
)();
