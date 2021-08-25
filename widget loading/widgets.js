var filenames=[]

function test()
{
$.get("file:///C:/Users/kpiek/IdeaProjects/Dashboard/Widgets",function(response){
   document.write(response);
   getNames();
    for (let i = 0; i < filenames.length; i++)
    {
        var str  = filenames[i];
        var path = 'C:/Users/kpiek/IdeaProjects/Dashboard/Widgets/' + filenames[i];
        if(str[str.length - 2] == "j") {
            var newScript = parent.document.createElement('script')
            newScript.type = 'text/javascript';
            newScript.src = path;
            document.getElementsByTagName('head')[0].appendChild(newScript);
        }
        if(str[str.length - 2] == "s"){
            var newCss = parent.document.createElement('link');
            newCss.rel = 'stylesheet';
            newCss.type = 'text/css';
            newCss.href = path;
            document.getElementsByTagName('head')[0].appendChild(newCss);
        }
    }

  document.body.innerHTML = '' +
      '<!DOCTYPE html>\n' +
      '<html>\n' +
      '<head>\n' +
      '\n' +
      '    <link rel="stylesheet" href="style-sheet.css">\n' +
      '    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Open+Sans" />\n' +
      '\n' +
      '</head>\n' +
      '<body>\n' +
      '<script src="jquery.js"></script>\n' +
      '<script src="widgets.js"></script>\n' +
      '\n' +
      '<main id="container" class="container">\n' +
      '\n' +
      '</main>\n' +
      '\n' +
      '\n' +
      '</body>\n' +
'</html>\n';
});
}

function getNames()
{
    var files = document.querySelectorAll("a.icon.file");
    files.forEach(function(item){filenames.push(item.textContent)})
}