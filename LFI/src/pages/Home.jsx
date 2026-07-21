import React from 'react';
import './Home.css';

function Home() {
  const featuredProperties = [
    {
      id: 1,
      tag: 'EN VENTA',
      tagClass: 'inversion',
      title: 'Villa Marítima',
      price: '$1.250.000',
      location: 'Costa Esmeralda, Zona Norte',
      specs: '4 Dorm. | 3 Baños | 450m²',
      imageSrc: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=60' 
    },
    {
      id: 2,
      tag: 'DISPONIBLE',
      tagClass: 'inversion',
      title: 'Torre Alvear',
      price: '$580.000',
      location: 'Distrito Financiero',
      specs: 'Piso 12 | 1.200m²',
      imageSrc: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      tag: 'ALQUILADO',
      tagClass: 'alquilado',
      title: 'La Estancia',
      price: '$950.000',
      location: 'Valle de las Nubes',
      specs: '2.5 Hect. | Sí Pool',
      imageSrc: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=60'
    }
  ];

  return (
    <div className="home-container">
      {/* NAVBAR */}
      <nav className="lf-navbar">
        <div className="lf-logo">La Finca</div>
        <ul className="lf-nav-links">
          <li><a href="#properties">Inmuebles</a></li>
          <li><a href="#rentals">Alquileres</a></li>
          <li><a href="#investments">Inversiones</a></li>
          <li><a href="#about">Nosotros</a></li>
        </ul>
        <div className="lf-auth-btns">
          <button className="btn-login">Login</button>
          <button className="btn-contact">Contacto</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Encuentra tu próximo legado.</h1>
          <p className="hero-subtitle">
            Gestión profesional de activos inmobiliarios con la estabilidad y el crecimiento que su patrimonio merece.
          </p>

          {/* BUSCADOR */}
          <div className="search-card">
            <div className="search-field">
              <label>Tipo</label>
              <select>
                <option>Residencial</option>
                <option>Comercial</option>
              </select>
            </div>
            <div className="search-field">
              <label>Localidad</label>
              <input type="text" placeholder="Ciudad o Zona" />
            </div>
            <div className="search-field">
              <label>Presupuesto</label>
              <select>
                <option>Cualquier precio</option>
              </select>
            </div>
            <button className="btn-search">🔍 Buscar</button>
          </div>
        </div>

        {/* IMAGEN DE PORTADA */}
        <div className="hero-image-container">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60" 
            alt="Portada La Finca" 
            className="hero-img" 
          />
        </div>
      </section>

      {/* INMUEBLES DESTACADOS */}
      <section className="featured-section">
        <div className="section-header">
          <div>
            <h2 className="featured-title">Inmuebles Destacados</h2>
            <p className="featured-subtitle">Selección exclusiva de propiedades bajo nuestra administración</p>
          </div>
          <a href="#catalogo" className="btn-see-all">Ver todo el catálogo →</a>
        </div>

        <div className="properties-grid">
          {featuredProperties.map((prop) => (
            <div key={prop.id} className="property-card">
              <div className="card-img-wrapper">
                <img 
                  src={prop.imageSrc} 
                  alt={prop.title} 
                  className="property-img" 
                />
                <span className={`badge ${prop.tagClass}`}>{prop.tag}</span>
              </div>

              <div className="card-body">
                <div className="card-title-row">
                  <h3 className="card-title">{prop.title}</h3>
                  <span className="card-price">{prop.price}</span>
                </div>
                <div className="card-location">📍 {prop.location}</div>
                <div className="card-specs">{prop.specs}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NUEVA SECCIÓN: POR QUÉ ELEGIRNOS / VALOR AGREGADO */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Gestión Transparente</h3>
            <p>Acceso en tiempo real a estados de cuenta, contratos y reportes financieros desde tu portal exclusivo.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Máxima Rentabilidad</h3>
            <p>Optimizamos el valor de tu propiedad en el mercado y garantizamos cobros puntuales cada mes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚖️</div>
            <h3>Soporte Jurídico</h3>
            <p>Asesoramiento legal e impositivo integral para proteger cada una de tus transacciones e inversiones.</p>
          </div>
        </div>
      </section>

      {/* FOOTER / PIE DE PÁGINA */}
      <footer className="lf-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="footer-logo">La Finca</h2>
            <p>Administración y gestión integral de propiedades e inversiones inmobiliarias.</p>
          </div>
          <div className="footer-links">
            <h4>Navegación</h4>
            <ul>
              <li><a href="#properties">Catálogo de Inmuebles</a></li>
              <li><a href="#rentals">Gestión de Alquileres</a></li>
              <li><a href="#about">Quiénes Somos</a></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contacto</h4>
            <p>📍 Av. Principal 1234, Centro</p>
            <p>📞 +54 11 4321-5678</p>
            <p>✉️ contacto@lafinca.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 La Finca. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;