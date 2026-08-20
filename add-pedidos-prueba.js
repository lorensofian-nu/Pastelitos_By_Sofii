#!/usr/bin/env node
/* =========================================================
   Script para Node.js: Agregar pedidos de prueba a Firebase RTDB
   ========================================================= */

const PEDIDOS_URL = "https://pastelitos-by-sofiii-default-rtdb.europe-west1.firebasedatabase.app/pedidos.json";

// Pedidos de prueba basados en los productos del menú
const PEDIDOS_PRUEBA = [
    {
        productId: "1",
        productName: "Cupcake de vainilla",
        quantity: 3,
        unitPrice: 3500,
        subtotal: 10500,
        iva: 1995,
        total: 12495,
        entrega: { tipo: "tienda" },
        date: new Date().toISOString()
    },
    {
        productId: "2",
        productName: "Brownie de chocolate",
        quantity: 2,
        unitPrice: 4000,
        subtotal: 8000,
        iva: 1520,
        total: 9520,
        entrega: { 
            tipo: "domicilio",
            direccion: "Calle 10 #5-20",
            barrio: "Centro",
            telefono: "3001234567",
            referencia: "Casa blanca con portal azúl"
        },
        date: new Date(Date.now() - 86400000).toISOString() // Ayer
    },
    {
        productId: "5",
        productName: "Pastel de fresa",
        quantity: 1,
        unitPrice: 5000,
        subtotal: 5000,
        iva: 950,
        total: 5950,
        entrega: { tipo: "tienda" },
        date: new Date(Date.now() - 172800000).toISOString() // Anteayer
    },
    {
        productId: "7",
        productName: "Cheesecake de frutos rojos",
        quantity: 1,
        unitPrice: 6500,
        subtotal: 6500,
        iva: 1235,
        total: 7735,
        entrega: { 
            tipo: "domicilio",
            direccion: "Avenida Siempre Viva 742",
            barrio: "Springfield",
            telefono: "3007777777",
            referencia: "Al lado de la taberna de Moe"
        },
        date: new Date(Date.now() - 259200000).toISOString() // Hace 3 días
    },
    {
        productId: "12",
        productName: "Croissant clásico",
        quantity: 4,
        unitPrice: 3800,
        subtotal: 15200,
        iva: 2888,
        total: 18088,
        entrega: { tipo: "tienda" },
        date: new Date(Date.now() - 345600000).toISOString() // Hace 4 días
    },
    {
        productId: "17",
        productName: "Pastel de chocolate negro",
        quantity: 1,
        unitPrice: 6800,
        subtotal: 6800,
        iva: 1292,
        total: 8092,
        entrega: { tipo: "tienda" },
        date: new Date(Date.now() - 432000000).toISOString() // Hace 5 días
    },
    {
        productId: "25",
        productName: "Chocolate caliente",
        quantity: 2,
        unitPrice: 3500,
        subtotal: 7000,
        iva: 1330,
        total: 8330,
        entrega: { tipo: "tienda" },
        date: new Date(Date.now() - 518400000).toISOString() // Hace 6 días
    }
];

async function createPedido(pedido) {
    const response = await fetch(PEDIDOS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
}

async function addAllPedidos() {
    console.log("🚀 Iniciando agregado de pedidos de prueba a Firebase...");
    console.log("URL destino:", PEDIDOS_URL);
    console.log("---\n");
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < PEDIDOS_PRUEBA.length; i++) {
        const pedido = PEDIDOS_PRUEBA[i];
        try {
            const result = await createPedido(pedido);
            console.log(`✅ ${i + 1}. Pedido de "${pedido.productName}" x${pedido.quantity} agregado (ID: ${result.name || 'N/A'})`);
            successCount++;
        } catch (error) {
            console.error(`❌ ${i + 1}. Pedido de "${pedido.productName}" falló:`, error.message);
            errorCount++;
        }
        
        // Pequeña pausa para evitar rate limiting
        if (i < PEDIDOS_PRUEBA.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.log("\n📊 Resumen:");
    console.log(`   ✅ Éxitos: ${successCount}`);
    console.log(`   ❌ Errores: ${errorCount}`);
    console.log(`   📝 Total: ${PEDIDOS_PRUEBA.length}`);
    
    if (errorCount === 0) {
        console.log("\n✨ Todos los pedidos de prueba fueron agregados correctamente!");
    } else {
        console.log("\n⚠️  Algunos pedidos fallaron. Revisa los errores arriba.");
    }
}

// Ejecutar
addAllPedidos().catch(console.error);
