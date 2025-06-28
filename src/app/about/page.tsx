"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Target,
  Award,
  Globe,
  Shield,
  Lightbulb,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedText from "@/components/ui/AnimatedText";
import {
  pageWrapperProps,
  staggerContainer,
  fadeInUp,
  fadeInDown,
  scaleIn,
  buttonHover,
  iconHover,
} from "@/lib/animations";

export default function AboutPage() {
  const router = useRouter();

  const teamMembers = [
    {
      name: "Danor Sinai",
      role: "CEO & CTO",
      description:
        "Full-stack developer and entrepreneur passionate about creating innovative e-commerce solutions.",
    },
    {
      name: "Sapir Sinai",
      role: "Co-Founder & Head of Operations",
      description:
        "Business strategist and operations expert, ensuring smooth day-to-day operations and customer satisfaction.",
    },
    {
      name: "Alma Sinai",
      role: "Chief Happiness Officer",
      description:
        "Our youngest team member who keeps us motivated and reminds us why we're building a better future.",
    },
  ];

  const values = [
    {
      icon: Shield,
      title: "Security First",
      description:
        "Your data and your customers' data security is our top priority.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We continuously evolve our platform with cutting-edge technology.",
    },
    {
      icon: Heart,
      title: "Customer Success",
      description:
        "Your success is our success. We're committed to helping you grow.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Built to scale with businesses from startup to enterprise level.",
    },
  ];

  return (
    <motion.div {...pageWrapperProps} className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        variants={fadeInDown}
        initial="initial"
        animate="animate"
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div variants={buttonHover} {...buttonHover}>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>
          <AnimatedText
            text="About Us"
            el="h1"
            className="text-4xl font-bold text-gray-900"
          />
          <AnimatedText
            text="Empowering businesses to succeed in the digital marketplace"
            el="p"
            className="text-xl text-gray-600 mt-2"
          />
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Our Mission
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-4xl mx-auto"
            >
              To democratize e-commerce technology by providing powerful,
              easy-to-use tools that help businesses of all sizes succeed in the
              digital marketplace. We believe every entrepreneur deserves access
              to enterprise-grade e-commerce solutions.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="text-center">
                <CardHeader>
                  <motion.div {...iconHover}>
                    <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  </motion.div>
                  <CardTitle>Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    To be the leading platform that empowers every business to
                    thrive in the global digital economy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center">
                <CardHeader>
                  <motion.div {...iconHover}>
                    <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  </motion.div>
                  <CardTitle>Our Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    A diverse team of passionate professionals dedicated to
                    building exceptional e-commerce experiences.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="text-center">
                <CardHeader>
                  <motion.div {...iconHover}>
                    <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  </motion.div>
                  <CardTitle>Our Promise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Reliable, secure, and innovative solutions that grow with
                    your business from day one to enterprise scale.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Company Story */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            Our Story
          </motion.h2>
          <motion.div
            variants={scaleIn}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-700 mb-6"
            >
              Our story began as a family dream. Danor Sinai, a passionate
              full-stack developer, recognized the challenges small businesses
              face when trying to establish their online presence. With the
              unwavering support of his wife Sapir and the daily inspiration
              from their daughter Alma, what started as late-night coding
              sessions became a mission to democratize e-commerce technology.
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-700 mb-6"
            >
              As a family-driven company, we understand the importance of
              building something meaningful that can support other families and
              their entrepreneurial dreams. Sapir brings her strategic mindset
              to ensure our operations run smoothly, while Alma reminds us every
              day why we&apos;re working towards a better digital future for the
              next generation.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg text-gray-700">
              We believe that the best businesses are built with heart,
              dedication, and family values. Every feature we develop, every
              customer we serve, and every challenge we overcome is guided by
              our commitment to helping other families and entrepreneurs achieve
              their dreams in the digital marketplace.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Values */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <motion.div {...iconHover}>
                      <value.icon className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                    </motion.div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <motion.div
                      variants={scaleIn}
                      className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center"
                    >
                      <Users className="h-10 w-10 text-gray-400" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={fadeInUp}
          className="text-center bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Our Story?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Become part of the community of successful businesses using our
            platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div {...buttonHover}>
              <Button size="lg" onClick={() => router.push("/login")}>
                Get Started Today
              </Button>
            </motion.div>
            <motion.div {...buttonHover}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/contact")}
              >
                Contact Us
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
