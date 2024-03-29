async function removeTagsFromMessages(message_body) {
    let content = message_body;
    if (content) {
     
	     content =content?.replaceAll('&nbsp;',' ')?.replaceAll(/ <\/em>/g, '_ ')?.replaceAll(/ <\/strong>/g, '* ')?.replaceAll(/<\/strong> /g, '*');
         content = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
         content = content.replace(/<strong[^>]*>/g, '*').replace(/<\/strong>/g, '*');
         content = content.replace(/<em[^>]*>/g, '_').replace(/<\/em>/g, '_');
       
       // content = content.replace(/<span*[^>]*>/g, '~').replace(/<\/span>/g, '~');
        content = content.replace(/<span\s+[^>]*style="[^"]*\btext-decoration:\s*line-through;[^"]*"[^>]*>(.*?)<\/span>/g, '~$1~');
        content = content.replace('&nbsp;', '\n')
        content = content.replace(/<br[^>]*>/g, '\n')
        content = content.replace(/<\/?[^>]+(>|$)/g, "")
        content = content.replace(/_\s*/g, '_').replace(/~\s*/g, '~').replace(/\*\s*/g, '*');
        content = content.replace(/\s*_/g, '_').replace(/\s*~/g, '~').replace(/\s*\*/g, '*');

        // content = content.replace(/\*\s*/g, '*');
        // content = content.replace(/\s*\*/g, '*');

    }
    return content;
}

module.exports = { removeTagsFromMessages }