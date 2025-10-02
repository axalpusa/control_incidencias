-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-10-2025 a las 21:50:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ciberseguridad`
--
CREATE DATABASE IF NOT EXISTS `ciberseguridad` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `ciberseguridad`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidentes`
--

CREATE TABLE `incidentes` (
  `id` int(11) NOT NULL,
  `id_reporte` int(11) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `impacto` varchar(20) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `accion` text DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(11) NOT NULL,
  `semana` varchar(50) DEFAULT NULL,
  `rango_fechas` varchar(100) DEFAULT NULL,
  `estado_general` varchar(20) DEFAULT NULL,
  `total_incidentes` int(11) NOT NULL DEFAULT 0,
  `semana_anterior` int(11) DEFAULT NULL,
  `tasa_resolucion` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tiempo_respuesta` varchar(50) DEFAULT NULL,
  `incidentes_resueltos` varchar(20) DEFAULT NULL,
  `variacion` varchar(20) DEFAULT NULL,
  `necesidades` text DEFAULT NULL,
  `recomendaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_por_categoria` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `incidentes`
--
ALTER TABLE `incidentes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_reporte` (`id_reporte`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `incidentes`
--
ALTER TABLE `incidentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `incidentes`
--
ALTER TABLE `incidentes`
  ADD CONSTRAINT `incidentes_ibfk_1` FOREIGN KEY (`id_reporte`) REFERENCES `reportes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incidentes_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`);
COMMIT;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `activo`, `fecha_creacion`) VALUES
(1, 'Phishing/Ingeniería Social', 'Ataques de suplantación de identidad y manipulación psicológica', 1, '2025-10-02 17:12:24'),
(2, 'Acceso No Autorizado', 'Intentos de acceso no autorizado a sistemas o datos', 1, '2025-10-02 17:12:24'),
(3, 'Malware Detectado', 'Software malicioso detectado en los sistemas', 1, '2025-10-02 17:12:24'),
(4, 'Vulnerabilidades', 'Vulnerabilidades de seguridad identificadas', 1, '2025-10-02 17:12:24'),
(5, 'Violación de Políticas', 'Incumplimiento de políticas de seguridad establecidas', 1, '2025-10-02 17:12:24'),
(6, 'Denegación de Servicio', 'Ataques que buscan interrumpir servicios', 1, '2025-10-02 17:12:24'),
(7, 'Fuga de Información', 'Pérdida o exposición no autorizada de datos', 1, '2025-10-02 17:12:24'),
(8, 'Suplantación de Identidad', 'Uso no autorizado de credenciales de acceso', 1, '2025-10-02 17:12:24');


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
