const postDeleteTransaction = (btn) => {
  console.log("brisanje");

  const transactionID = btn.parentNode.querySelector(
    `[name="transactionID"]`
  ).value;
  const userID = btn.parentNode.querySelector('[name="userID"]').value;
  const transactionhtml = btn.parentNode;
  const csrf = btn.parentNode.querySelector('[name="_csrf"]').value;

  fetch(
    `http://localhost:3000/admin/delete?transactionID=${transactionID}&userID=${userID}`,
    {
      method: "DELETE",
      headers: {
        "csrf-token": csrf,
      },
    }
  )
    .then((res) => {
      return res.json();
    })
    .then((final) => {
      if (final.message === "deleted profile successfully") {
        window.location = "/admin/allUsers";
      } else {
        document.querySelector("#debt").innerHTML = final.debt + " din";
        const thisDateDiv = transactionhtml.parentNode;
        transactionhtml.remove();
        thisDateDiv.querySelectorAll(".transaction")[0] ||
        thisDateDiv.querySelectorAll(".deposit-transaction")[0] ||
        thisDateDiv.querySelectorAll(".descripted-deposit-transaction")[0]
          ? ""
          : thisDateDiv.remove();
      }
    })
    .catch((er) => {
      console.log(er);
    });
};
const approveTransaction = (btn) => {
  const parentDiv = btn.parentNode;

  const name = parentDiv.querySelector(".name").innerText;
  const deposit = +parentDiv.querySelector(".deposit").innerText;
  const description = parentDiv.querySelector(".description").innerText;
  const price = +parentDiv.querySelector(".price").innerText;
  const quantity = +parentDiv.querySelector(".quantity").innerText;
  const type = parentDiv.querySelector(".type").innerText;
  const csrfToken = parentDiv.querySelector(`._csrf`).value;
  const userID = parentDiv.querySelector(`.userID`).value;
  const transactionID = parentDiv.querySelector(".transactionID").value;

  fetch(
    `http://localhost:3000/admin/approveTransaction?name=${name}&deposit=${deposit}&description=${description}&price=${price}&quantity=${quantity}&type=${type}&userID=${userID}&transactionID=${transactionID}`,
    {
      method: "POST",

      headers: {
        "csrf-token": csrfToken, // Include the CSRF token in the header
      },
    }
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.message === "radi") parentDiv.remove();
    })
    .catch((er) => {
      console.log(er);
    });
};
const rejectTransaction = (btn) => {
  const parentDiv = btn.parentNode;

  const name = parentDiv.querySelector(".name").value;
  const deposit = parentDiv.querySelector(".deposit").value;
  const description = parentDiv.querySelector(".description").value;
  const price = parentDiv.querySelector(".price").value;
  const quantity = parentDiv.querySelector(".quantity").value;
  const type = parentDiv.querySelector(".type").value;
  const csrfToken = parentDiv.querySelector(`[name="_csrf"]`).value;
  const userID = parentDiv.querySelector(`[name="userID"]`).value;
};
