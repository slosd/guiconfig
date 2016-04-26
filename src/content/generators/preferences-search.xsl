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
                xmlns:str="http://exslt.org/strings"
                xmlns:p="http://guiconfig.freedig.org/preferences"
                extension-element-prefixes="str">

  <xsl:output method="xml"
              indent="no"
              media-type="application/vnd.mozilla.xul+xml" />

  <xsl:param name="query" />

  <xsl:include href="chars.xsl" />

  <xsl:template match="p:pref">
    <xsl:variable name="key" select="ancestor-or-self::*[@key and not(starts-with(@key, 'guiconfig.'))][1]/@key" />
    <xsl:if test="$key">
      <xsl:attribute name="data-key"><xsl:value-of select="$key" /></xsl:attribute>
    </xsl:if>
    <xsl:if test="@description">
      <xsl:attribute name="data-description"><xsl:value-of select="@description" /></xsl:attribute>
    </xsl:if>
    <xsl:attribute name="data-minVersion"><xsl:value-of select="ancestor-or-self::*[@minVersion][1]/@minVersion" /></xsl:attribute>
    <xsl:attribute name="data-maxVersion"><xsl:value-of select="ancestor-or-self::*[@maxVersion][1]/@maxVersion" /></xsl:attribute>
    <xsl:attribute name="data-platform"><xsl:value-of select="ancestor-or-self::*[@platform][1]/@platform" /></xsl:attribute>
    <xsl:attribute name="breadcrumbs">
      <xsl:for-each select="ancestor::*[@label]">
        <xsl:value-of select="@label" />
        <xsl:if test="position() != last()"> » </xsl:if>
      </xsl:for-each>
    </xsl:attribute>
    <xsl:attribute name="label">
      <xsl:choose>
        <xsl:when test="@label"><xsl:value-of select="@label" /></xsl:when>
        <xsl:when test="p:view"><xsl:value-of select="p:view/*[1]/@label" /></xsl:when>
        <xsl:otherwise><xsl:value-of select="ancestor::*[@label][1]/@label" /></xsl:otherwise>
      </xsl:choose>
    </xsl:attribute>
    <separator class="thin"/>
  </xsl:template>

  <xsl:template match="*" />

  <xsl:template match="/p:preferences">
    <xsl:variable name="query_set" select="str:split(translate($query, $chars_upper, $chars_lower), ' ')" />

    <prefpane>
      <vbox flex="1" style="overflow:auto">
        <xsl:for-each select="//p:pref">
          <xsl:variable name="info">
            <xsl:for-each select="ancestor::*[@label] | p:view//*[@label or @description] | p:option[@label]">
              <xsl:value-of select="concat(@label, ' ', @description, ' ')" />
            </xsl:for-each>
          </xsl:variable>
          <xsl:variable name="terms" select="translate(concat(@label, ' ', @description, ' ', $info), $chars_upper, $chars_lower)" />
          <xsl:variable name="term_set" select="str:split($terms, ' ')" />
          <xsl:variable name="match_set" select="$query_set[contains($terms, .)]" />

          <xsl:if test="count($match_set) >= count($query_set)">
            <box class="gcsearchresult">
              <xsl:apply-templates select="." />
            </box>
          </xsl:if>
        </xsl:for-each>
      </vbox>
    </prefpane>
  </xsl:template>

</xsl:stylesheet>
