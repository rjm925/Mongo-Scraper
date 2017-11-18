$(document).on("click", "#scrape", function() {
	console.log("scrape");
	$.get("/scrape", function(result) {
		console.log(result);
	});
	setTimeout(function(){ location.reload(); }, 1000);
});

$(document).on("click", ".save", function() {
	let thisId = $(this).attr("data-id");
	console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/save/articles/" + thisId,
    data: {
      saved: true
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });
   location.reload();
});

$.getJSON("/articles", function(data) {
  // For each one
  for (let i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    if (data[i].saved === false) {
    	$(".article-container")
    .prepend(`
    <div class ="panel panel-default">
    	<div class="panel-heading">
    		<h3>
    			<a class="article-link" target="_blank"	href="${data[i].link}">${data[i].title}</a>
    			<a class="btn btn-success save" data-id=${data[i]._id}>SAVE ARTICLE</a>
    		</h3>
    	</div>
    	<div class="panel-body">${data[i].summary}</div>
    </div>
    	`)
    }
  }
});