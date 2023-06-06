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
