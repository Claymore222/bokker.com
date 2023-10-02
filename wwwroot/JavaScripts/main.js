async function deleteBook(bookId) {
  var result = confirm("Are you sure you want to delete this item?");
  if (result == true) {
    try {
      const response = await fetch(`/library/${bookId}`, {
        method: "DELETE",
      });
      if (response.status === 401) {
        window.location.href = "/error/401/?reason=notauthorized";
      } else if (response.status === 403) {
        window.location.href = "/error/403?reason=NeedToLogin";
      } else if (response.status === 200) {
        window.location.href = "/library";
      } else {
        window.location.href = "/error/404?reason=bookNotFound";
      }
    } catch (error) {
      window.location.href = "/error/500";
    }
  }
}
async function library(event) {
  try {
    const response = await fetch("/library");
    if (response.ok) {
      window.location.href = "/library";
    } else {
      window.location.href = "/error/404";
    }
  } catch (error) {
    window.location.href = "/error/404";
  }
}
async function logout(event) {
  try {
    const response = await fetch("/logout");
    if (response.ok) {
      window.location.href = "/login";
    } else {
      window.location.href = "/error/404";
    }
  } catch (error) {
    window.location.href = "/error/404";
  }
}
async function home(event) {
  event.preventDefault();

  try {
    const response = await fetch("/home");
    if (response.ok) {
      window.location.href = "/home";
    } else {
      window.location.href = "/error/404";
    }
  } catch (error) {
    window.location.href = "/error/404";
  }
}
async function addbook(event) {
  try {
    const response = await fetch("/addbook");
    if (response.ok) {
      window.location.href = "/addbook";
    } else {
      window.location.href = "/error/404";
    }
  } catch (error) {
    window.location.href = "/error/404";
  }
}
