#!/usr/bin/env node
/* =========================================================
   Script para Node.js: Agregar 20 productos a Firebase RTDB
   ========================================================= */

const BASE_URL = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/menu.json";

const NEW_PRODUCTS = [
    { name: "Cheesecake de frutos rojos", price: 6500, image: "images/menu/cheesecake_frutos_rojos.jpg" },
    { name: "Tiramisú clásico", price: 7200, image: "images/menu/tiramisu.jpg" },
    { name: "Flan de caramelo", price: 4500, image: "images/menu/flan_caramelo.jpg" },
    { name: "Panna cotta de vainilla", price: 5800, image: "images/menu/panna_cotta.jpg" },
    { name: "Tarta de limón merengada", price: 5500, image: "images/menu/tarta_limon.jpg" },
    { name: "Croissant clásico", price: 3800, image: "images/menu/croissant.jpg" },
    { name: "Concha de azúcar", price: 2800, image: "images/menu/concha_azucar.jpg" },
    { name: "Pan de muerto", price: 4200, image: "images/menu/pan_muerto.jpg" },
    { name: "Orejas (hojaldre)", price: 3500, image: "images/menu/orejas_hojaldre.jpg" },
    { name: "Empanada de piña", price: 3200, image: "images/menu/empanada_pina.jpg" },
    { name: "Pastel de chocolate negro", price: 6800, image: "images/menu/pastel_chocolate_negro.jpg" },
    { name: "Pastel de zanahoria", price: 6200, image: "images/menu/pastel_zanahoria.jpg" },
    { name: "Pastel de red velvet", price: 7500, image: "images/menu/pastel_red_velvet.jpg" },
    { name: "Tres leches", price: 5800, image: "images/menu/tres_leches.jpg" },
    { name: "Galleta de avena y pasas", price: 2200, image: "images/menu/galleta_avena.jpg" },
    { name: "Alfajor de maicena", price: 2500, image: "images/menu/alfajor_maicena.jpg" },
    { name: "Churros con chocolate", price: 4000, image: "images/menu/churros_chocolate.jpg" },
    { name: "Palmeritas de hojaldre", price: 2800, image: "images/menu/palmeritas.jpg" },
    { name: "Chocolate caliente", price: 3500, image: "images/menu/chocolate_caliente.jpg" },
    { name: "Café con leche", price: 2500, image: "images/menu/cafe_con_leche.jpg" },
    { name: "Té de manzanilla", price: 2000, image: "images/menu/te_manzanilla.jpg" }
];

async function addProduct(product) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
}

async function addAllProducts() {
    console.log("🚀 Iniciando agregado de 20 productos al menú...");
    console.log("URL destino:", BASE_URL);
    console.log("---\n");
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < NEW_PRODUCTS.length; i++) {
        const product = NEW_PRODUCTS[i];
        try {
            const result = await addProduct(product);
            console.log(`✅ ${i + 1}. "${product.name}" agregado (ID: ${result.name || 'N/A'})`);
            successCount++;
        } catch (error) {
            console.error(`❌ ${i + 1}. "${product.name}" falló:`, error.message);
            errorCount++;
        }
        
        // Pequeña pausa para evitar rate limiting
        if (i < NEW_PRODUCTS.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.log("\n📊 Resumen:");
    console.log(`   ✅ Éxitos: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📝 Total: ${NEW_PRODUCTS.length}`);
    
    if (errorCount === 0) {
        console.log("\n✨ Todos los productos fueron agregados correctamente!");
    } else {
        console.log("\n⚠️  Algunos productos fallaron. Revisa los errores arriba.");
    }
}

// Ejecutar
addAllProducts().catch(console.error);
