import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Ship,
  Plane,
  Shield,
  Truck,
  FileText,
  Globe,
  Clock,
  Users,
} from "lucide-react";
import whyChooseUsImage from "../assets/images/why choose us.png";
import servicesHeaderImage from "../assets/images/our services.png";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Ship,
      title: t("importServices"),
      description:
        "Comprehensive import solutions for pharmaceutical products from global manufacturers.",
      features: [
        "Supplier verification and qualification",
        "Quality control and testing",
        "Customs clearance and documentation",
        "Regulatory compliance assistance",
        "Inventory management and tracking",
      ],
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Plane,
      title: t("exportServices"),
      description:
        "Efficient export services to deliver pharmaceutical products worldwide.",
      features: [
        "Market research and entry strategies",
        "Export documentation and licensing",
        "Quality certification and compliance",
        "Logistics and shipping coordination",
        "After-sales support and training",
      ],
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: t("compliance"),
      description:
        "Expert regulatory compliance services for international pharmaceutical trade.",
      features: [
        "FDA, EMA, and WHO compliance",
        "Documentation and certification",
        "Regulatory updates and guidance",
        "Audit preparation and support",
        "Quality system implementation",
      ],
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Truck,
      title: t("logistics"),
      description:
        "End-to-end logistics solutions for pharmaceutical supply chain management.",
      features: [
        "Temperature-controlled transportation",
        "Real-time tracking and monitoring",
        "Warehousing and distribution",
        "Risk management and insurance",
        "24/7 customer support",
      ],
      color: "from-orange-500 to-orange-600",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Consultation & Planning",
      description:
        "Initial consultation to understand your requirements and develop a customized solution.",
      icon: Users,
    },
    {
      step: "02",
      title: "Regulatory Compliance",
      description:
        "Ensure all products meet international regulatory standards and requirements.",
      icon: Shield,
    },
    {
      step: "03",
      title: "Quality Assurance",
      description:
        "Rigorous quality control and testing procedures for all pharmaceutical products.",
      icon: FileText,
    },
    {
      step: "04",
      title: "Logistics & Delivery",
      description:
        "Efficient transportation and delivery to your specified location worldwide.",
      icon: Truck,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen pt-5">
      {/* Hero Section */}
      <section className="relative pt-0 pb-20 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          <img
            src={servicesHeaderImage}
            alt="Our Services"
            className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover"
          />
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="card p-8 group border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-300"
              >
                <div
                  className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Process
            </h2>
            <div className="h-1 w-28 mx-auto mb-4 rounded-full bg-gradient-to-r from-black via-fuchsia-500 to-black" />
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We follow a systematic approach to ensure quality, compliance, and
              customer satisfaction at every step.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {step.step}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-8 h-8 text-primary-500" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose Our Services?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Globe,
                    title: "Global Expertise",
                    description:
                      "Over 15 years of experience in international pharmaceutical trade across 50+ countries.",
                  },
                  {
                    icon: Clock,
                    title: "Fast Turnaround",
                    description:
                      "Efficient processes and dedicated teams ensure quick delivery and response times.",
                  },
                  {
                    icon: Shield,
                    title: "Quality Guarantee",
                    description:
                      "100% quality assurance with comprehensive testing and compliance verification.",
                  },
                  {
                    icon: Users,
                    title: "Dedicated Support",
                    description:
                      "24/7 customer support and dedicated account managers for personalized service.",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="w-full h-80 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl flex items-center justify-center p-6">
                <img
                  src={whyChooseUsImage}
                  alt="Why Choose Our Services"
                  className="w-full h-full object-contain rounded-xl border-4 border-white dark:border-gray-700 shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Contact our team today to discuss your pharmaceutical
              import/export needs and discover how we can help you succeed.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transform transition-all duration-300"
            >
              Get a Free Consultation
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services;
