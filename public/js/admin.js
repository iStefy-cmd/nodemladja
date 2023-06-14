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

  const name = parentDiv.querySelector(".name").textContent;
  const deposit = parentDiv.querySelector(".deposit")
    ? +parentDiv.querySelector(".deposit").textContent
    : 0;
  const description = parentDiv.querySelector(".description")
    ? parentDiv.querySelector(".description").textContent
    : "notdeposit";
  const price = parentDiv.querySelector(".price")
    ? +parentDiv.querySelector(".price").textContent
    : 1;
  const quantity = parentDiv.querySelector(".quantity")
    ? +parentDiv.querySelector(".quantity").textContent
    : deposit;
  const type = parentDiv.querySelector(".type").textContent;
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
      if (data.message === "radi") {
        const reqDiv = parentDiv.parentNode.parentNode;
        reqDiv.style.backgroundColor = "green";
        reqDiv.style.transition = "600ms ease-in-out";
        setTimeout(() => {
          reqDiv.style.backgroundColor = "rgb(144 238 144)";
          parentDiv.remove();
        }, 600);
      }
    })
    .catch((er) => {
      console.log(er);
    });
};
const rejectTransaction = (btn) => {
  const parentDiv = btn.parentNode;

  const csrfToken = parentDiv.querySelector(`._csrf`).value;

  const transactionID = parentDiv.querySelector(".transactionID").value;

  fetch(
    `http://localhost:3000/admin/rejectTransaction?transactionID=${transactionID}`,
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
      if (data.message === "rejected") {
        const reqDiv = parentDiv.parentNode.parentNode;
        reqDiv.style.backgroundColor = "red";
        reqDiv.style.transition = "600ms ease-in-out";
        setTimeout(() => {
          reqDiv.style.backgroundColor = "rgb(144 238 144)";
          parentDiv.remove();
        }, 600);
      }
    })
    .catch((er) => {
      console.log(er);
    });
};
