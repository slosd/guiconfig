<?xml version="1.0"?>
<!--
    Copyright (C) 2014, 2015 Thomas Leberbauer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<!DOCTYPE stylesheet SYSTEM "chrome://guiconfig/locale/gcLocale.dtd">
<xsl:stylesheet version="1.0"
                xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:p="http://guiconfig.freedig.org/preferences">

  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml"
              cdata-section-elements="script" />

  <xsl:template match="p:pref" mode="script_filter">
    if (isPreferenceSupported('<xsl:value-of select="@minVersion" />',
                              '<xsl:value-of select="@maxVersion" />',
                              '<xsl:value-of select="@platform" />'))
  </xsl:template>

  <xsl:template match="p:pref" mode="script_init_dependency">
    <xsl:apply-templates select="." mode="script_filter" />
    registerDependencies('<xsl:value-of select="@key" />', [<xsl:apply-templates select="p:dependency" mode="json" />]);
  </xsl:template>

  <xsl:template match="p:pref" mode="script_init_behavior">
    <xsl:apply-templates select="." mode="script_filter" />
    registerBehavior('<xsl:value-of select="@key" />', {
      <xsl:for-each select="p:behavior/p:override">
        '<xsl:value-of select="@name" />': function(view, value) { <xsl:value-of select="string(.)" /> },
      </xsl:for-each>
    });
  </xsl:template>

  <xsl:template match="p:dependency" mode="json">
    {
      <xsl:if test="@equals">'equals': <xsl:value-of select="@equals" />,</xsl:if>
      <xsl:if test="@in">'in': [<xsl:value-of select="@in" />],</xsl:if>
      'key': '<xsl:value-of select="@key" />'
    } <xsl:if test="position() != last()">,</xsl:if>
  </xsl:template>

  <xsl:template match="*" />

  <xsl:template match="/p:preferences">
    <script type="application/javascript">
      (function() {
        <xsl:apply-templates select="//p:pref[p:dependency]" mode="script_init_dependency" />
        <xsl:apply-templates select="//p:pref[p:behavior/p:override]" mode="script_init_behavior" />
      })();
    </script>
  </xsl:template>
</xsl:stylesheet>
