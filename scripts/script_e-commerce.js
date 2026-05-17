//variables globales
const input = document.getElementById("ObtenerInput");
const buscarInput = document.getElementById("buscarInput");
const getProductos = document.getElementById("obtener");
const getP = document.getElementById("buscar_productos");
const contenido = document.getElementById("resultado");
const carritoBuscar = document.getElementById("buscar_carrito");
const guardar = document.getElementById("btnGuardar");
const username = document.getElementById("username");
const password = document.getElementById("password");
const login = document.getElementById("login");
const usuario = document.getElementById("buscar_usuarios");
const btnUusuario = document.getElementById("obtener_usuarios");

const inicializar = () => {
  //funciones por eventos de delegacion
  getProductos.addEventListener("click", obtener);
  getP.addEventListener("click", obtenerP);
  carritoBuscar.addEventListener("click", obtenerCarritoUsuario);
  login.addEventListener("click", IniciarSesion);
  btnUusuario.addEventListener("click", listaUsuarios);
};
const obtener = async () => {
  if (!input.value) {
    alert("ingrese un valor para obtener los productos");
    return;
  }
  try {
    const data = await fetch("https://fakestoreapi.com/products");
    const res = await data.json();
    if (input.value > res.length) {
      alert(
        `el numero ingresado es mayor a la cantidad de productos disponibles, ingrese un numero menor a ${res.length}`,
      );
      return;
    }
    console.log(res);
    // destructuracion de lo que regrese la api
    // const {id,title,price, descripcion,category, image} = res;
    contenido.innerHTML = res
      .slice(0, input.value)
      .map(
        (producto) =>
          `<div class="tarjeta">
            <h5>${producto.id}</h5>
            <h5 class="p-titulo">TITULO: ${producto.title}</h5>
            <h5 class="p-precio">PRECIO: ${producto.price}</h5>
            <p class="p-desc">DESCRIPCION: ${producto.description}</p>
            <p class="p-cat">CATEGORIA: ${producto.category}</p>
            <img src="${producto.image}"/>
            <button onclick="editar(${producto.id},this)">Editar</button>
            <button onclick="eliminar(${producto.id},this)">Eliminar</button>
        </div>`,
      )
      .join("");
  } catch (error) {
    alert("fallo al hacer la peticion");
  }
};
const obtenerP = async () => {
  if (!buscarInput.value) {
    alert("ingrese un valor para encontrar el producto");
    return;
  }
  try {
    const data = await fetch(
      `https://fakestoreapi.com/products/${buscarInput.value}`,
    );
    const res = await data.json();
    console.log(res);
    const { id, title, price, description, category, image } = res;
    contenido.innerHTML = `
      <div class="tarjeta">
        <h5 class="p-titulo">TITULO: ${title}</h5>
        <h5 class="p-precio">PRECIO${price}</h5>
        <p class="p-desc">DESCRIPCION: ${description}</p>
        <p class="p-cat">CATEGORIA: ${category}</p>
        <img src="${image}"/>
        <button onclick="editar(${id},this)">Editar</button>
        <button onclick="eliminar(${id},this)">Eliminar</button>
      </div>`;
  } catch (error) {
    alert("fallo al hacer la peticion");
  }
};
const obtenerCarritoUsuario = async () => {
  const inputC = document.getElementById("buscarCarrito");
  if (!inputC.value) {
    alert("ingrese un valor para encontrar el usuario");
    return;
  }
  try {
    const res = await fetch("https://fakestoreapi.com/carts");
    const data = await res.json();
    console.log(data);
    const filtro = data.find((nombre) => inputC.value == nombre.userId);
    if (!filtro) {
      alert("no se encontro el carrito del usuario ingresado");
      return;
    }
    console.log(filtro);
    const productosFiltrados = await Promise.all(
      filtro.products.map(async (p) => {
        // Se hace una peticion en forma de arreglo dentro de cada producto para usar
        // la propiedad de productId que hay en cada filtro de productos y a su vez obtener
        // el producto asociado a ese id
        const resP = await fetch(
          `https://fakestoreapi.com/products/${p.productId}`,
        );
        const datap = await resP.json();
        // spread operator para juntar y regresar el la info del mapeo
        // y solo se junta en un spread para que tambien obtenga la
        // cantidad
        return { ...datap, quantity: p.quantity };
      }),
    );
    console.log(productosFiltrados);
    renderizarProductos(filtro.id, filtro.userId, productosFiltrados);
    // const [{ id, userId, products }] = filtro;
  } catch (error) {
    alert("hubo un error al obtener el carrito", error);
    return;
  }
};

function renderizarProductos(id, userId, productoR) {
  contenido.innerHTML = `
    <div class="tarjeta">
      <header>
        <h2>Carrito ID: ${id}</h2>
        <h4>Usuario ID: ${userId}</h4>
      </header>
      <div class="lista-productos">
          ${productoR
            .map(
              (p) => `
              <div class="producto-item">
                  <img src="${p.image}" alt="${p.title}" width="50">
                  <h5 class="p-titulo">TITULO: ${p.title}</h5>
                  <p class="p-precio">Precio unitario: $${p.price}</p>
                  <p>Cantidad: ${p.quantity}</p>
                  <p class="p-desc">DESCRIPCION: ${p.description}</p>
                  <p class="p-cat">CATEGORIA: ${p.category}</p>
                  <p>Cantidad: ${p.quantity}</p>
                  <p><strong>Subtotal: $${(p.price * p.quantity).toFixed(2)}</strong></p>
              </div>
          `,
            )
            .join("")}
      </div>
  </div>`;
}
const editar = async (id, btn) => {
  console.log("el id de la tarjeta es: ", id, "y su referencia es", btn);
  const modal = document.getElementById("modal");
  const titulo = document.getElementById("titulo");
  const precio = document.getElementById("price");
  const descripcion = document.getElementById("description");
  const categoria = document.getElementById("category");
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const data = await res.json();
    console.log(data);
    const { title, price, description, category } = data;
    titulo.value = title;
    precio.value = price;
    descripcion.value = description;
    categoria.value = category;
    modal.showModal();
    if (guardar) {
      guardar.addEventListener("click", async () => {
        const nuevoT = titulo.value;
        const nuevoP = precio.value;
        const nuevoD = descripcion.value;
        const nuevoC = categoria.value;
        if (!nuevoT || !nuevoP || !nuevoD || !nuevoC) {
          alert("ningun campo debe estar vacio");
        }
        try {
          console.log(
            "los campos rescatados son: ",
            nuevoT,
            nuevoP,
            nuevoD,
            nuevoC,
          );
          const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: nuevoT,
              description: nuevoD,
              price: nuevoP,
              category: nuevoC,
            }),
          });
          const data = await res.json();
          const tarjeta = btn.closest(".tarjeta");
          if (tarjeta) {
            tarjeta.querySelector(".p-titulo").textContent =
              `TITULO: ${data.title}`;
            tarjeta.querySelector(".p-desc").textContent =
              `DESCRIPCION: ${data.description}`;
            tarjeta.querySelector(".p-precio").textContent =
              `PRECIO: $${data.price}`;
            tarjeta.querySelector(".p-cat").textContent =
              `CATEGORIA: ${data.category}`;
            alert("ACTUALIZADO CORRECTAMENTE!!");
          } else {
            alert("no se encontro la tarjeta");
          }
          modal.close();
        } catch (error) {
          console.log(error);
          alert("hubo un error al actualizar el producto", error);
        }
      });
    }
  } catch (error) {
    console.log(error);
    alert("no se encontro el producto seleccionado", error);
  }
};
const eliminar = async (id, btn) => {
  console.log("el id de la tarjeta es: ", id, "y su referencia es", btn);
  try {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      const tarjeta = btn.closest(".tarjeta");
      setTimeout(() => {
        tarjeta.style.opacity = "0.3";
        alert("ELIIMINADO CORRECTAMENTE!!");
        tarjeta.remove();
      }, 1500);
    }
    console.log(data);
  } catch (error) {
    console.error(error);
  }
};
const IniciarSesion = async () => {
  if (!username.value || !password.value) {
    alert("ingrese un correo o contraseña");
  }
  console.log("el user y la contra son: ", username.value, password.value);

  try {
    const user = username.value;
    const contra = password.value;
    const data = await fetch("https://fakestoreapi.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        password: contra,
      }),
    });
    const res = await data.json();
    console.log(res);
    alert("SE INICIO CORRECTAMENTE SESION, BIENVENIDO");
  } catch (error) {
    alert("no se pudo iniciar sesion", error);
    console.error(error);
  }
};
const listaUsuarios = async () => {
  try {
    const data = await fetch("https://fakestoreapi.com/users");
    const res = await data.json();
    console.log(res);
    console.log(usuario.value);
    if (usuario.value > res.length) {
      alert(
        `el numero ingresado es mayor a la cantidad de usuarios disponibles, ingrese un numero menor a ${res.length}`,
      );
      return;
    }

    // destructuracion de lo que regrese la api
    // const {id,title,price, descripcion,category, image} = res;
    contenido.innerHTML = res
      .slice(0, usuario.value)
      .map(
        (user) =>
          `<div class="tarjeta">
            <h5>ID: ${user.id}</h5>
            <h5 class="p-titulo">USERNAME ${user.username}</h5>
            <h5 class="p-precio">EMAIL: ${user.email}</h5>
            <p class="p-desc">PASSWORD: ${user.password}</p>
        </div>`,
      )
      .join("");
  } catch (error) {
    alert("fallo al hacer la peticion");
  }
};
inicializar();
