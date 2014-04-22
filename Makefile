run ::
	python -m SimpleHTTPServer 8888 | jade -w ./*.jade | lsc -cw ./js
