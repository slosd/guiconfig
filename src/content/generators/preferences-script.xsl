<?xml version="1.0"?>
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

  <xsl:template match="p:pref" mode="script_init_button_select_file">
    <xsl:apply-templates select="." mode="script_filter" />
    registerSelectFileButton('<xsl:value-of select="@key" />',
        [<xsl:for-each select="p:mode/p:filterType">
           '<xsl:value-of select="@value" />'<xsl:if test="position() != last()">,</xsl:if>
         </xsl:for-each>]);
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
        <xsl:apply-templates select="//p:pref[@mode = 'file' or p:mode/@name = 'file']" mode="script_init_button_select_file" />
      })();
    </script>
  </xsl:template>
</xsl:stylesheet>
