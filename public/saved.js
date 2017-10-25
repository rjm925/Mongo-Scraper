$(document).on("click", ".delete", function() {
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/delete/articles/" + thisId,
    data: {
      saved: false
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });
  location.reload();
});

$(document).on("click", ".notes", function() {
  var thisId = $(this).attr("data-id");
  $("#notes").empty();
  $("#myModal").modal('toggle');
  $(".modal-header").html(`<h4>Notes For Article: ${thisId}</h4>`);
  $("#savenote").attr("data-id", thisId);

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data[0].note);
      for(var i = 0; i < data[0].note.length; i++) {
        $("#notes")
        .append(`
          <div class="articleNotes">
            <span>${data[0].note[i].body}</span>
            <a class="btn btn-danger deleteNote" data-id=${data[0].note[i]._id}>X</a>
          </div>    
        `)
      }
    })
})

$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#body").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });

  $("#body").val("");
});

$(document).on("click", ".deleteNote", function() {
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/delete/note/" + thisId,
    data: {
      id: thisId
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });

    $("#myModal").modal('toggle');
});

$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    if (data[i].saved === true) {
        $(".article-container")
    .append(`
    <div class ="panel panel-default">
        <div class="panel-heading">
            <h3>
                <a class="article-link" target="_blank" href="${data[i].link}">${data[i].title}</a>
                <a class="btn btn-info notes" data-id=${data[i]._id}>ARTICLE NOTES</a>
                <a class="btn btn-danger delete" data-id=${data[i]._id}>DELETE FROM SAVED</a>
            </h3>
        </div>
        <div class="panel-body">${data[i].summary}</div>
    </div>
        `)
    }
  }
});