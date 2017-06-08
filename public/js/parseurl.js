var parseUrlRegex = /4chan\.org\/(\w+)\/thread\/(\d+)/;

function submitUrl(e) {
    var url = $('#threadurl').val();
    if (url.length > 0) {
        var parsed = parseUrlRegex.exec(url);
        if (parsed && parsed.length === 3) {
            var board = parsed[1];
            var thread = parsed[2];
            var checkUrl = `/check/${board}/${thread}`;
            window.open(checkUrl, '_self');
        } else {
            raiseError();
        }
    } else {
        raiseError();
    }
}

function raiseError() {
    if (! document.getElementById('errorDiv') ) {
        var errorAlert = document.createElement('div');
        errorAlert.id = 'errorDiv';
        errorAlert.className = 'alert alert-warning';
        errorAlert.innerHTML = '<strong>Error:</strong> Enter a valid thread URL.';
        $('#input').append(errorAlert);
    }
}
