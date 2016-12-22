(function() {
    window.editor = UE.getEditor('container', {
        initialFrameWidth: 800,
        initialFrameHeight: 500
    });
    setTimeout(function () {
        editor.execCommand('drafts');
    }, 500);

})()
