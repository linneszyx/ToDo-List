const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-linneszyx:test1234@myatlasclusteredu.1svixrw.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item.",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});
const defaultItems = [item1, item2, item3];
const listScheme = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listScheme);

app.get("/", async (req, res) => {
  const foundItems = await Item.find();
  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
});
app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    const foundList = await List.findOne({ name: listName });
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }
});
app.post("/delete", async (req, res) => {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    const removeItem = await Item.findByIdAndRemove(checkItemId);
    res.redirect("/");
  } else {
    const foundList = List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } }
    );
    res.redirect("/" + listName);
  }
});
app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  const foundList = await List.findOne({ name: customListName });
  if (!foundList) {
    const list = new List({
      name: customListName,
      items: defaultItems,
    });
    list.save();
    res.redirect("/" + customListName);
  } else {
    res.render("list", {
      listTitle: foundList.name,
      newListItems: foundList.items,
    });
  }
});
app.get("/about", (req, res) => {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;

}
app.listen(port,function(){
  console.log("Server has started successfully");
});