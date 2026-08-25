<script lang="ts">
  let element: HTMLElement;
  let attributeName = "style";

  function restyle() {
    const inlineStyle = element.style;
    const classes = element.classList;
    element.style.setProperty("color", "red");
    element.classList.add("bg-red-500");
    inlineStyle.color = "red";
    classes.toggle("bg-red-500");
    element.className = "bg-red-500";
    element.setAttribute("style", "color:red");
    element.removeAttributeNS(null, "class");
    element.setAttribute(attributeName, "color:red");
    Object.assign(element.style, { color: "red" });
  }
</script>
